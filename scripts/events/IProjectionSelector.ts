import IProjectionRunner from "../projections/IProjectionRunner";

interface IProjectionSelector {
    select(eventType:string):IProjectionRunner<any>[];
}

export default IProjectionSelector