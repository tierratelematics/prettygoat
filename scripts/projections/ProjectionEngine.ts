import IProjectionEngine from "./IProjectionEngine";
import {injectable, inject} from "inversify";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import * as _ from "lodash";
import AreaRegistry from "../registry/AreaRegistry";
import PushContext from "../push/PushContext";
import {ISnapshotRepository, Snapshot} from "../snapshots/ISnapshotRepository";
import RegistryEntry from "../registry/RegistryEntry";
import ILogger from "../log/ILogger";
import NullLogger from "../log/NullLogger";
import {IProjection} from "./IProjection";
import {IPushNotifier} from "../push/IPushComponents";
import IAsyncPublisher from "../util/IAsyncPublisher";
import IProjectionRunnerFactory from "./IProjectionRunnerFactory";

type SnapshotData = [string, Snapshot<any>];

@injectable()
class ProjectionEngine implements IProjectionEngine {

    constructor(@inject("IProjectionRunnerFactory") private runnerFactory: IProjectionRunnerFactory,
                @inject("IPushNotifier") private pushNotifier: IPushNotifier,
                @inject("IProjectionRegistry") private registry: IProjectionRegistry,
                @inject("ISnapshotRepository") private snapshotRepository: ISnapshotRepository,
                @inject("ILogger") private logger: ILogger = NullLogger,
                @inject("IAsyncPublisher") private publisher: IAsyncPublisher<SnapshotData>) {
        publisher.items()
            .flatMap(snapshotData => {
                return this.snapshotRepository.saveSnapshot(snapshotData[0], snapshotData[1]).map(() => snapshotData);
            })
            .subscribe(snapshotData => {
                let streamId = snapshotData[0],
                    snapshot = snapshotData[1];
                this.logger.info(`Snapshot saved for ${streamId} at time ${snapshot.lastEvent.toISOString()}`);
            });
    }

    run(projection?: IProjection<any>, context?: PushContext) {
        if (projection) {
            this.snapshotRepository.getSnapshot(projection.name).subscribe(snapshot => {
                this.startProjection(projection, context, snapshot);
            });
        } else {
            this.snapshotRepository
                .initialize()
                .flatMap(() => this.snapshotRepository.getSnapshots())
                .subscribe(snapshots => {
                    let areas = this.registry.getAreas();
                    _.forEach<AreaRegistry>(areas, areaRegistry => {
                        _.forEach<RegistryEntry<any>>(areaRegistry.entries, (entry: RegistryEntry<any>) => {
                            this.startProjection(entry.projection, new PushContext(areaRegistry.area, entry.exposedName), snapshots[entry.projection.name]);
                        });
                    });
                });
        }
    }

    private startProjection(projection: IProjection<any>, context: PushContext, snapshot?: Snapshot<any>) {
        let runner = this.runnerFactory.create(projection);

        let sequence = runner
            .notifications()
            .do(notification => {
                let snapshotStrategy = projection.snapshotStrategy,
                    state = notification[0];
                if (state.timestamp && snapshotStrategy && snapshotStrategy.needsSnapshot(state)) {
                    this.publisher.publish([state.type, new Snapshot(runner.state, state.timestamp)]);
                }
            });

        let subscription = sequence.subscribe(notification => {
            if (!notification[1]) this.notifyContext(context, null);
            else _.forEach(notification[1], key => this.notifyContext(context, key));
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
