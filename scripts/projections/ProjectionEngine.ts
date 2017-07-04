import IProjectionEngine from "./IProjectionEngine";
import {injectable, inject} from "inversify";
import * as _ from "lodash";
import PushContext from "../push/PushContext";
import {ISnapshotRepository, Snapshot} from "../snapshots/ISnapshotRepository";
import ILogger from "../log/ILogger";
import NullLogger from "../log/NullLogger";
import {IProjection} from "./IProjection";
import {IPushNotifier} from "../push/IPushComponents";
import IAsyncPublisher from "../common/IAsyncPublisher";
import IProjectionRunnerFactory from "./IProjectionRunnerFactory";
import {IProjectionRegistry} from "../bootstrap/ProjectionRegistry";
import {IReadModelNotifier} from "../readmodels/ReadModelNotifier";

type SnapshotData = [string, Snapshot<any>];

@injectable()
class ProjectionEngine implements IProjectionEngine {

    constructor(@inject("IProjectionRunnerFactory") private runnerFactory: IProjectionRunnerFactory,
                @inject("IPushNotifier") private pushNotifier: IPushNotifier,
                @inject("IProjectionRegistry") private registry: IProjectionRegistry,
                @inject("ISnapshotRepository") private snapshotRepository: ISnapshotRepository,
                @inject("ILogger") private logger: ILogger = NullLogger,
                @inject("IAsyncPublisher") private publisher: IAsyncPublisher<SnapshotData>,
                @inject("IReadModelNotifier") private readModelNotifier: IReadModelNotifier) {
        publisher.items()
            .flatMap(snapshotData => this.snapshotRepository.saveSnapshot(snapshotData[0], snapshotData[1]).then(() => snapshotData))
            .subscribe(snapshotData => {
                let streamId = snapshotData[0],
                    snapshot = snapshotData[1];
                this.logger.info(`Snapshot saved for ${streamId} at time ${snapshot.lastEvent.toISOString()}`);
            });
    }

    async run(projection?: IProjection<any>, context?: PushContext) {
        if (projection) {
            let snapshot = await this.snapshotRepository.getSnapshot(projection.name);
            this.startProjection(projection, context, snapshot);
        } else {
            let projections = this.registry.projections();
            _.forEach(projections, async (entry) => {
                let snapshot = await this.snapshotRepository.getSnapshot(entry[1].name);
                this.startProjection(entry[1], new PushContext(entry[0], entry[1].name), snapshot);
            });
        }
    }

    private startProjection(projection: IProjection<any>, context: PushContext, snapshot: Snapshot<any>) {
        let runner = this.runnerFactory.create(projection);

        let subscription = runner
            .notifications()
            .do(event => {
                let snapshotStrategy = projection.snapshot;
                if (event.timestamp && snapshotStrategy && snapshotStrategy.needsSnapshot(event)) {
                    this.publisher.publish([event.type, new Snapshot(event.payload, event.timestamp)]);
                }
            })
            .subscribe(notification => {

            }, error => {
                subscription.dispose();
                this.logger.error(error);
            });

        runner.run(snapshot);
    }

    private notifyContext(context: PushContext, notifyKey: string = null) {
        this.pushNotifier.notify(context, notifyKey);
        this.logger.info(`Notifying state change on ${context.area}:${context.projectionName} ${notifyKey ? "with key " + notifyKey : ""}`);
    }
}

export default ProjectionEngine
