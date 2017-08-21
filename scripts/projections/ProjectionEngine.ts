import IProjectionEngine from "./IProjectionEngine";
import {injectable, inject} from "inversify";
import {forEach, map, flatten, includes, concat, reduce} from "lodash";
import PushContext from "../push/PushContext";
import {ISnapshotRepository, Snapshot} from "../snapshots/ISnapshotRepository";
import ILogger from "../log/ILogger";
import NullLogger from "../log/NullLogger";
import {IProjection} from "./IProjection";
import {IPushNotifier} from "../push/PushComponents";
import IProjectionRunnerFactory from "./IProjectionRunnerFactory";
import {IProjectionRegistry} from "../bootstrap/ProjectionRegistry";
import {IReadModelNotifier} from "../readmodels/ReadModelNotifier";
import SpecialEvents from "../events/SpecialEvents";
import Dictionary from "../common/Dictionary";
import {IAsyncPublisherFactory} from "../common/AsyncPublisherFactory";

type SnapshotData = [string, Snapshot<any>];

type NotificationData = [PushContext, string, Date];

@injectable()
class ProjectionEngine implements IProjectionEngine {

    constructor(@inject("IProjectionRunnerFactory") private runnerFactory: IProjectionRunnerFactory,
                @inject("IPushNotifier") private pushNotifier: IPushNotifier,
                @inject("IProjectionRegistry") private registry: IProjectionRegistry,
                @inject("ISnapshotRepository") private snapshotRepository: ISnapshotRepository,
                @inject("ILogger") private logger: ILogger = NullLogger,
                @inject("IAsyncPublisherFactory") private publisherFactory: IAsyncPublisherFactory,
                @inject("IReadModelNotifier") private readModelNotifier: IReadModelNotifier) {
    }

    async run(projection?: IProjection<any>) {
        if (projection) {
            await this.startProjection(projection);
        } else {
            let projections = this.registry.projections();
            forEach(projections, async (entry) => {
                await this.startProjection(entry[1]);
            });
        }
    }

    private async startProjection(projection: IProjection) {
        let snapshot: Snapshot<any> = null;
        try {
            snapshot = await this.snapshotRepository.getSnapshot(projection.name);
        } catch (error) {
            this.logger.error(`Snapshot loading has failed on projection ${projection.name}`);
            this.logger.error(error);
        }

        let runner = this.runnerFactory.create(projection),
            area = this.registry.projectionFor(projection.name)[0],
            readModels = !projection.publish ? [] : flatten(map(projection.publish, point => {
                return !point.readmodels ? [] : map(point.readmodels.$list, readmodel => {
                    return this.readModelNotifier.changes(readmodel).map(event => [event, []]);
                });
            }));

        let snapshotsPublisher = this.publisherFactory.publisherFor<SnapshotData>(runner);
        let notificationsPublisher = this.publisherFactory.publisherFor<NotificationData>(runner);

        snapshotsPublisher.items()
            .flatMap(snapshotData => this.snapshotRepository.saveSnapshot(snapshotData[0], snapshotData[1]).then(() => snapshotData))
            .subscribe(snapshotData => {
                let streamId = snapshotData[0],
                    snapshotPayload = snapshotData[1];
                this.logger.info(`Snapshot saved for ${streamId} at time ${snapshotPayload.lastEvent.toISOString()}`);
            });

        notificationsPublisher.items(item => item[1]).subscribe(notification => {
            let [context, notifyKey, timestamp] = notification;
            this.pushNotifier.notifyAll(context, notifyKey, timestamp);
            this.logger.info(`Notify state change on ${context.area}:${context.projectionName} ${notifyKey ? "with key " + notifyKey : ""}`);
        });

        let subscription = runner.notifications()
            .do(notification => {
                let snapshotStrategy = projection.snapshot,
                    state = notification[0];
                if (state.timestamp && snapshotStrategy && snapshotStrategy.needsSnapshot(state)) {
                    snapshotsPublisher.publish([state.type, new Snapshot(state.payload, state.timestamp)]);
                }
            })
            .merge(...readModels)
            .subscribe(notification => {
                if (!projection.publish) {
                    this.readModelNotifier.notifyChanged(projection.name, notification[0].timestamp);
                } else {
                    let contexts = notification[0].type === SpecialEvents.READMODEL_CHANGED
                        ? this.readmodelChangeKeys(projection, area, runner.state, notification[0].payload)
                        : this.projectionChangeKeys(notification[1], area);

                    forEach(contexts, context => notificationsPublisher.publish([context[0], context[1], notification[0].timestamp]));
                }
            }, error => {
                subscription.unsubscribe();
                this.logger.error(error);
            });

        runner.run(snapshot);
    }

    private readmodelChangeKeys(projection: IProjection, area: string, state: any, readModel: string): NotificationData[] {
        return reduce(projection.publish, (result, publishBlock, point) => {
            if (publishBlock.readmodels && includes(publishBlock.readmodels.$list, readModel)) {
                let notificationKeys = publishBlock.readmodels.$change(state);
                result = concat(result, map<string, [PushContext, string]>(notificationKeys, key => [new PushContext(area, point), key]));
            }
            return result;
        }, []);
    }

    private projectionChangeKeys(notifications: Dictionary<string[]>, area: string): NotificationData[] {
        return reduce(notifications, (result, notificationKeys, point) => {
            return concat(result, map<string, [PushContext, string]>(notificationKeys, key => [new PushContext(area, point), key]));
        }, []);
    }
}

export default ProjectionEngine
