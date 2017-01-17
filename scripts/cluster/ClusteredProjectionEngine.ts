import IProjectionEngine from "../projections/IProjectionEngine";
import {inject, injectable} from "inversify";
import {IProjection} from "../projections/IProjection";
import PushContext from "../push/PushContext";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import {ISnapshotRepository, Snapshot} from "../snapshots/ISnapshotRepository";
import Dictionary from "../Dictionary";
import IProjectionRunner from "../projections/IProjectionRunner";
import * as _ from "lodash";
import RegistryEntry from "../registry/RegistryEntry";
import AreaRegistry from "../registry/AreaRegistry";

@injectable()
class ClusteredProjectionEngine implements IProjectionEngine {

    constructor(@inject("ProjectionEngine") private engine: IProjectionEngine,
                @inject("IProjectionRegistry") private registry: IProjectionRegistry,
                @inject("ISnapshotRepository") private snapshotRepository: ISnapshotRepository,
                @inject("IProjectionRunnerHolder") private holder: Dictionary<IProjectionRunner<any>>) {

    }

    run(projection?: IProjection<any>, context?: PushContext, snapshot?:Snapshot<any>) {
        this.engine.run(projection, context, snapshot);
    }

    restart(projection?: IProjection<any>, context?: PushContext, snapshot?:Snapshot<any>) {
        this.snapshotRepository.getSnapshots().subscribe(snapshots => {
            let areas = this.registry.getAreas();
            _.forEach<AreaRegistry>(areas, areaRegistry => {
                _.forEach<RegistryEntry<any>>(areaRegistry.entries, (entry: RegistryEntry<any>) => {
                    this.run(entry.projection, new PushContext(entry.name, areaRegistry.area), snapshots[entry.projection.name]);
                });
            });
        });
    }

}

export default ClusteredProjectionEngine