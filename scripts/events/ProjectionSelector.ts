import IProjectionSelector from "./IProjectionSelector";
import IProjectionRunner from "../projections/IProjectionRunner";

class ProjectionSelector implements IProjectionSelector {

    constructor() {

    }

    select(eventType:string):IProjectionRunner<any>[] {
        return null;
    }

}

export default ProjectionSelector