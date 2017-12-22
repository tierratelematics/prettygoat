import IProjectionEngine from "./IProjectionEngine";
import {injectable, inject} from "inversify";
import {forEach, map, flatten, includes, concat, reduce, compact, isUndefined, mapValues, filter} from "lodash";
import PushContext from "../push/PushContext";
import {ISnapshotRepository, Snapshot} from "../snapshots/ISnapshotRepository";
import {ILogger, NullLogger, LoggingContext} from "inversify-logging";
import {IProjection} from "./IProjection";
import {IPushNotifier} from "../push/PushComponents";
import IProjectionRunnerFactory from "./IProjectionRunnerFactory";
import {IProjectionRegistry} from "../bootstrap/ProjectionRegistry";
import {IReadModelNotifier} from "../readmodels/ReadModelNotifier";
import SpecialEvents from "../events/SpecialEvents";
import Dictionary from "../common/Dictionary";
import {IAsyncPublisherFactory} from "../common/AsyncPublisherFactory";
import {Event} from "../events/Event";
import IAsyncPublisher from "../common/IAsyncPublisher";
import {ISnapshotProducer} from "../snapshots/SnapshotProducer";
import {Observable} from "rxjs";
import {retrySequence, toArray} from "../common/TypesUtil";
import { READMODEL_DEFAULT_NOTIFY } from "../readmodels/IReadModel";
import { ReadModelNotification } from "../readmodels/ReadModelNotifier";

type SnapshotData = [string, Snapshot<any>];

type NotificationData = [PushContext, string, Event];

@injectable()
@LoggingContext("ProjectionEngine")
class ProjectionEngine implements IProjectionEngine {

    @inject("ILogger") private logger: ILogger = NullLogger;

    constructor(@inject("IProjectionRunnerFactory") private runnerFactory: IProjectionRunnerFactory,
                @inject("IPushNotifier") private pushNotifier: IPushNotifier,
                @inject("IProjectionRegistry") private registry: IProjectionRegistry,
                @inject("ISnapshotRepository") private snapshotRepository: ISnapshotRepository,
                @inject("IAsyncPublisherFactory") private publisherFactory: IAsyncPublisherFactory,
                @inject("IReadModelNotifier") private readModelNotifier: IReadModelNotifier,
                @inject("ISnapshotProducer") private snapshotProducer: ISnapshotProducer,
                @inject("SnapshotsHolder") private snapshotsHolder: Dictionary<Snapshot>) {
    }

    async run(projection?: IProjection<any>) {
        if (projection) {
            await this.startProjection(projection);
        } else {
            let projections = filter(this.registry.projections(), entry => !!entry[1].publish),
                readmodels = filter(this.registry.projections(), entry => !entry[1].publish);
            forEach(concat(readmodels, projections), async (entry) => {
                await this.startProjection(entry[1]);
            });
        }
    }

    private async startProjection(projection: IProjection) {
        let logger = this.logger.createChildLogger(projection.name);
        let snapshot: Snapshot<any> = null;
        try {
            snapshot = await this.snapshotRepository.getSnapshot(projection.name);
            this.snapshotsHolder[projection.name] = snapshot;
        } catch (error) {
            logger.error(`Snapshot loading has failed`);
            logger.error(error);
        }

        let runner = this.runnerFactory.create(projection),
            area = this.registry.projectionFor(projection.name)[0],
            readModels = !projection.publish ? [] : flatten(map(projection.publish, point => {
                return !point.readmodels ? [] : map(point.readmodels.$list, readmodel => {
                    return this.readModelNotifier.changes(readmodel).map<ReadModelNotification, [Event, Dictionary<string[]>]>(value => {
                        let notify = {};
                        notify[READMODEL_DEFAULT_NOTIFY] = value[1];
                        return [value[0], notify];
                    });
                });
            }));

        let snapshotsPublisher = this.publisherFactory.publisherFor<SnapshotData>(runner);
        let notificationsPublisher = this.publisherFactory.publisherFor<NotificationData>(runner);

        this.saveSnapshots(snapshotsPublisher, logger);
        this.publishNotifications(notificationsPublisher, projection, logger);

        let subscription = runner.notifications()
            .do(notification => {
                let snapshotStrategy = projection.snapshot,
                    state = notification[0];
                if (state.timestamp && snapshotStrategy && snapshotStrategy.needsSnapshot(state)) {
                    snapshotsPublisher.publish([state.type, this.snapshotProducer.produce(state)]);
                }
            })
            .merge(...readModels)
            .subscribe(notification => {
                if (!projection.publish) {
                    this.readModelNotifier.notifyChanged(notification[0], notification[1][READMODEL_DEFAULT_NOTIFY]);
                } else {
                    let contexts = notification[0].type === SpecialEvents.READMODEL_CHANGED
                        ? this.readmodelChangeKeys(projection, area, runner.state, notification[0].payload, notification[1][READMODEL_DEFAULT_NOTIFY])
                        : this.projectionChangeKeys(notification[1], area);

                    forEach(contexts, context => notificationsPublisher.publish([context[0], context[1], notification[0]]));
                }
            }, error => {
                subscription.unsubscribe();
                logger.error(error);
            });

        runner.run(snapshot);
    }

    private saveSnapshots(snapshotsPublisher: IAsyncPublisher<SnapshotData>, logger: ILogger) {
        snapshotsPublisher.items()
            .flatMap(snapshotData => Observable.defer(() => this.snapshotRepository.saveSnapshot(snapshotData[0], snapshotData[1]).then(() => snapshotData))
                .let(retrySequence(error => logger.error(error))))
            .subscribe(snapshotData => {
                let snapshotPayload = snapshotData[1];
                logger.info(`Snapshot saved at time ${snapshotPayload.lastEvent.toISOString()}`);
            });
    }

    private publishNotifications(notificationsPublisher: IAsyncPublisher<NotificationData>, projection: IProjection, logger: ILogger) {
        let loggers = mapValues(projection.publish, (point, name) => logger.createChildLogger(name));

        notificationsPublisher.items(item => `${item[0].area}:${item[0].projectionName}:${item[1]}`)
            .subscribe(notification => {
                let [context, notifyKey, event] = notification;
                this.pushNotifier.notifyAll(context, event, notifyKey);
                loggers[context.projectionName].debug(`Notify clients under notification key: ${notifyKey}`);
            });
    }

    private readmodelChangeKeys(projection: IProjection, area: string, state: any, readModel: string, notify: string[]): NotificationData[] {
        return reduce(projection.publish, (result, publishBlock, point) => {
            let context = new PushContext(area, point);
            if (publishBlock.readmodels && includes(publishBlock.readmodels.$list, readModel)) {
                let notificationKeys = toArray<string>(publishBlock.readmodels.$change(state, notify));
                result = concat(result, map<string, [PushContext, string]>(notificationKeys, key => [context, key]));
            }
            return result;
        }, []);
    }

    private projectionChangeKeys(notifications: Dictionary<string[]>, area: string): NotificationData[] {
        return reduce(notifications, (result, notificationKeys, point) => {
            let context = new PushContext(area, point);
            return concat(result, compact(map<string, [PushContext, string]>(notificationKeys, key => {
                return !isUndefined(key) ? [context, key] : key;
            })));
        }, []);
    }
}

export default ProjectionEngine
