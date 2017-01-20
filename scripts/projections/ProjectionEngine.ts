import IProjectionEngine from "./IProjectionEngine";
import {injectable, inject} from "inversify";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import * as _ from "lodash";
import AreaRegistry from "../registry/AreaRegistry";
import PushContext from "../web/PushContext";
import {ISnapshotRepository, Snapshot} from "../snapshots/ISnapshotRepository";
import RegistryEntry from "../registry/RegistryEntry";
import IProjectionRunnerFactory from "./IProjectionRunnerFactory";
import ILogger from "../log/ILogger";
import NullLogger from "../log/NullLogger";
import IProjectionSorter from "./IProjectionSorter";
import {IProjection} from "./IProjection";
import {IPushNotifier} from "../web/IPushComponents";

@injectable()
class ProjectionEngine implements IProjectionEngine {

    constructor(@inject("IProjectionRunnerFactory") private runnerFactory: IProjectionRunnerFactory,
                @inject("IPushNotifier") private pushNotifier: IPushNotifier,
                @inject("IProjectionRegistry") private registry: IProjectionRegistry,
                @inject("ISnapshotRepository") private snapshotRepository: ISnapshotRepository,
                @inject("ILogger") private logger: ILogger = NullLogger,
                @inject("IProjectionSorter") private sorter: IProjectionSorter) {
    }

    run(projection?: IProjection<any>, context?: PushContext) {
        if (projection) {
            this.snapshotRepository.getSnapshot(projection.name).subscribe(snapshot => {
                this.runSingleProjection(projection, context, snapshot);
            });
        } else {
            this.sorter.sort();
            this.snapshotRepository
                .initialize()
                .flatMap(() => this.snapshotRepository.getSnapshots())
                .subscribe(snapshots => {
                    let areas = this.registry.getAreas();
                    _.forEach<AreaRegistry>(areas, areaRegistry => {
                        _.forEach<RegistryEntry<any>>(areaRegistry.entries, (entry: RegistryEntry<any>) => {
                            let projection = entry.projection;
                            this.runSingleProjection(projection, new PushContext(entry.name, areaRegistry.area), snapshots[projection.name]);
                        });
                    });
                });
        }
    }

    private runSingleProjection(projection: IProjection<any>, context: PushContext, snapshot?: Snapshot<any>) {
        let runner = this.runnerFactory.create(projection);

        let sequence = runner
            .notifications()
            .do(state => {
                let snapshotStrategy = projection.snapshotStrategy;
                if (state.timestamp && snapshotStrategy && snapshotStrategy.needsSnapshot(state)) {
                    this.snapshotRepository.saveSnapshot(state.type, new Snapshot(runner.state, state.timestamp));
                    this.logger.info(`Saving snapshot for ${state.type} at time ${state.timestamp.toISOString()}`);
                }
            })
            .sample(200);

        let subscription = sequence.subscribe(state => {
            this.pushNotifier.notify(context, null, state.splitKey);
            this.logger.info(`Notifying state change on ${context.area}:${context.projectionName} with key ${state.splitKey}`);
        }, error => {
            subscription.dispose();
            this.logger.error(error);
            this.logger.info(`Restarting projection due to error ${projection.name}`);
            this.run(projection, context);
        });

        runner.run(snapshot);
    }
}

export default ProjectionEngine