import IProjectionEngine from "../projections/IProjectionEngine";
import {inject, injectable} from "inversify";
import {IProjection} from "../projections/IProjection";
import PushContext from "../web/PushContext";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import {ISnapshotRepository} from "../snapshots/ISnapshotRepository";
import Dictionary from "../util/Dictionary";
import IProjectionRunner from "../projections/IProjectionRunner";
import * as _ from "lodash";
import RegistryEntry from "../registry/RegistryEntry";
import AreaRegistry from "../registry/AreaRegistry";
import IProjectionSorter from "../projections/IProjectionSorter";
import ICluster from "./ICluster";
import {ProjectionRunnerStatus} from "../projections/ProjectionRunnerStatus";

@injectable()
class ClusteredProjectionEngine implements IProjectionEngine {

    constructor(@inject("ProjectionEngine") private engine: IProjectionEngine,
                @inject("IProjectionRegistry") private registry: IProjectionRegistry,
                @inject("ISnapshotRepository") private snapshotRepository: ISnapshotRepository,
                @inject("IProjectionSorter") private sorter: IProjectionSorter,
                @inject("IProjectionRunnerHolder") private holder: Dictionary<IProjectionRunner<any>>,
                @inject("ICluster") private cluster: ICluster) {

    }

    run(projection?: IProjection<any>, context?: PushContext) {
        if (projection) {
            this.engine.run(projection, context);
        } else {
            this.sorter.sort();
            this.snapshotRepository
                .initialize()
                .subscribe(() => {
                    let areas = this.registry.getAreas();
                    _.forEach<AreaRegistry>(areas, areaRegistry => {
                        _.forEach<RegistryEntry<any>>(areaRegistry.entries, (entry: RegistryEntry<any>) => {
                            let projection = entry.projection,
                                runner = this.holder[projection.name];
                            if (this.cluster.lookup(projection.name) === this.cluster.whoami()) {
                                if (!runner || (runner && runner.status !== ProjectionRunnerStatus.Run)) {
                                    this.engine.run(projection, new PushContext(entry.exposedName, areaRegistry.area));
                                }
                            } else if (runner && runner.status !== ProjectionRunnerStatus.Stop) {
                                runner.stop();
                                delete this.holder[projection.name];
                            }
                        });
                    });
                });
        }
    }
}

export default ClusteredProjectionEngine