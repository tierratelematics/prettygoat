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

type NotificationData = [PushContext, string];

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
            let snapshot = await this.snapshotRepository.getSnapshot(projection.name);
            this.startProjection(projection, snapshot);
        } else {
            let projections = this.registry.projections();
            forEach(projections, async (entry) => {
                let snapshot = await this.snapshotRepository.getSnapshot(entry[1].name);
                this.startProjection(entry[1], snapshot);
            });
        }
    }

    private startProjection(projection: IProjection, snapshot: Snapshot<any>) {
        let runner = this.runnerFactory.create(projection),
            area = this.registry.projectionFor(projection.name)[0],
            readModels = !projection.publish ? [] : flatten(map(projection.publish, point => {
                return !point.readmodels ? [] : map(point.readmodels.$list, readmodel => {
                    return this.readModelNotifier.changes(readmodel).map(event => [event, []]);
                });
            }));

        let snapshotsPublisher = this.publisherFactory.publisherFor<SnapshotData>(runner);
        let notificationsPublisher = this.publisherFactory.publisherFor(runner);

        snapshotsPublisher.items()
            .flatMap(snapshotData => this.snapshotRepository.saveSnapshot(snapshotData[0], snapshotData[1]).then(() => snapshotData))
            .subscribe(snapshotData => {
                let streamId = snapshotData[0],
                    snapshotPayload = snapshotData[1];
                this.logger.info(`Snapshot saved for ${streamId} at time ${snapshotPayload.lastEvent.toISOString()}`);
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
                }
                let contexts = notification[0].type === SpecialEvents.READMODEL_CHANGED
                    ? this.readmodelChangeKeys(projection, area, runner.state, notification[0].payload)
                    : this.projectionChangeKeys(notification[1], area);

                forEach(contexts, context => this.notifyStateChange(context[0], context[1]));
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

    private notifyStateChange(context: PushContext, notifyKey: string) {
        this.pushNotifier.notify(context, notifyKey);
        this.logger.info(`Notifying state change on ${context.area}:${context.projectionName} ${notifyKey ? "with key " + notifyKey : ""}`);
    }
}

export default ProjectionEngine
