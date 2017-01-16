import IProjectionEngine from "../projections/IProjectionEngine";
import {inject, injectable} from "inversify";

@injectable()
class ClusteredProjectionEngine implements IProjectionEngine {

    constructor(@inject("ProjectionEngine") private engine:IProjectionEngine) {

    }

    run(projection?: IProjection<any>, context?: PushContext) {
    }

    restart(projection?: IProjection<any>, context?: PushContext) {
    }

}

export default ClusteredProjectionEngine