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

@injectable()
class ProjectionEngine implements IProjectionEngine {

    constructor(@inject("IProjectionRunnerFactory") private runnerFactory:IProjectionRunnerFactory,
                @inject("IPushNotifier") private pushNotifier:IPushNotifier,
                @inject("IProjectionRegistry") private registry:IProjectionRegistry,
                @inject("IStatePublisher") private statePublisher:IStatePublisher,
                @inject("ISnapshotRepository") private snapshotRepository:ISnapshotRepository,
                @inject("ILogger") private logger:ILogger = NullLogger,
                @inject("TopologicSort") private sort:IProjectionSorter
    ) {
    }

    run():void {
        try{
            this.sort.sort();
            this.snapshotRepository
                .initialize()
                .flatMap(a => this.snapshotRepository.getSnapshots())
                .map(snapshots => {
                    let areas = this.registry.getAreas();
                    _.forEach<AreaRegistry>(areas, areaRegistry => {
                        _.forEach<RegistryEntry<any>>(areaRegistry.entries, (entry:RegistryEntry<any>) => {
                            let runner = this.runnerFactory.create(entry.projection),
                                context = new PushContext(areaRegistry.area, entry.name);
                            runner.notifications().sample(500).subscribe(state => {
                                let snapshotStrategy = entry.projection.snapshotStrategy;
                                this.pushNotifier.notify(context, null, state.splitKey);
                                this.logger.info(`Notifying state change on ${context.area}:${context.viewmodelId} with key ${state.splitKey}`);
                                if (snapshotStrategy && snapshotStrategy.needsSnapshot(state)) {
                                    this.logger.info(`Saving snapshot for ${state.type} at time ${state.timestamp.toISOString()}`);
                                    this.snapshotRepository.saveSnapshot(state.type, new Snapshot(runner.state, state.timestamp));
                                }
                            }, error => this.logger.error(error));
                            this.statePublisher.publish(runner, context);
                            runner.run(snapshots[entry.projection.name]);
                        });
                    });
                }).subscribe(() => null);
        }
        catch(e){
            this.logger.error(e.toString());
        }
    }
}

export default ProjectionEngine