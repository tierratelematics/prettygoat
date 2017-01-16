import IProjectionEngine from "../projections/IProjectionEngine";
import {inject, injectable} from "inversify";
import {IProjection} from "../projections/IProjection";
import PushContext from "../push/PushContext";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import {ISnapshotRepository} from "../snapshots/ISnapshotRepository";
import Dictionary from "../Dictionary";
import IProjectionRunner from "../projections/IProjectionRunner";

@injectable()
class ClusteredProjectionEngine implements IProjectionEngine {

    constructor(@inject("ProjectionEngine") private engine:IProjectionEngine,
                @inject("IProjectionRegistry") private registry:IProjectionRegistry,
                @inject("ISnapshotRepository") private snapshotRepository:ISnapshotRepository,
                @inject("IProjectionRunnerHolder") private holder:Dictionary<IProjectionRunner<any>>) {

    }

    run(projection?: IProjection<any>, context?: PushContext) {
    }

    restart(projection?: IProjection<any>, context?: PushContext) {
    }

}

export default ClusteredProjectionEngine