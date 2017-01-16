import IProjectionEngine from "./IProjectionEngine";
import IPushNotifier from "../push/IPushNotifier";
import {injectable, inject} from "inversify";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import * as _ from "lodash";
import AreaRegistry from "../registry/AreaRegistry";
import PushContext from "../push/PushContext";
import IStatePublisher from "../routing/IStatePublisher";
import {ISnapshotRepository, Snapshot} from "../snapshots/ISnapshotRepository";
import RegistryEntry from "../registry/RegistryEntry";
import IProjectionRunnerFactory from "./IProjectionRunnerFactory";
import ILogger from "../log/ILogger";
import NullLogger from "../log/NullLogger";
import IProjectionSorter from "./IProjectionSorter";
import {IProjection} from "./IProjection";
import Dictionary from "../Dictionary";

@injectable()
class ProjectionEngine implements IProjectionEngine {

    snapshots: Dictionary<Snapshot<any>>;

    constructor(@inject("IProjectionRunnerFactory") private runnerFactory: IProjectionRunnerFactory,
                @inject("IPushNotifier") private pushNotifier: IPushNotifier,
                @inject("IProjectionRegistry") private registry: IProjectionRegistry,
                @inject("IStatePublisher") private statePublisher: IStatePublisher,
                @inject("ISnapshotRepository") private snapshotRepository: ISnapshotRepository,
                @inject("ILogger") private logger: ILogger = NullLogger,
                @inject("IProjectionSorter") private sorter: IProjectionSorter) {
    }

    run(projection?: IProjection<any>, context?: PushContext) {
        if (!projection) {
            this.sorter.sort();
            this.snapshotRepository.initialize().subscribe(() => this.restart(projection));
        } else {
            this.createProjection(projection, context);
        }
    }

    private createProjection(projection: IProjection<any>, context: PushContext) {
        let runner = this.runnerFactory.create(projection);

        runner
            .notifications()
            .do(state => {
                let snapshotStrategy = projection.snapshotStrategy;
                if (state.timestamp && snapshotStrategy && snapshotStrategy.needsSnapshot(state)) {
                    this.snapshotRepository.saveSnapshot(state.type, new Snapshot(runner.state, state.timestamp));
                    this.logger.info(`Saving snapshot for ${state.type} at time ${state.timestamp.toISOString()}`);
                }
            })
            .sample(200)
            .subscribe(state => {
                this.pushNotifier.notify(context, null, state.splitKey);
                this.logger.info(`Notifying state change on ${context.area}:${context.viewmodelId} with key ${state.splitKey}`);
            }, error => this.logger.error(error));

        this.statePublisher.publish(runner, context);
        runner.run(this.snapshots[projection.name]);
    }

    restart(projection?: IProjection<any>, context?: PushContext) {
        this.snapshotRepository.getSnapshots().subscribe(snapshots => {
            this.snapshots = snapshots;
            let areas = this.registry.getAreas();
            _.forEach<AreaRegistry>(areas, areaRegistry => {
                _.forEach<RegistryEntry<any>>(areaRegistry.entries, (entry: RegistryEntry<any>) => {
                    this.createProjection(entry.projection, new PushContext(entry.name, areaRegistry.area));
                });
            });
        });
    }
}

export default ProjectionEngine