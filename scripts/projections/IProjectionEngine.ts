import {IProjection} from "./IProjection";

interface IProjectionEngine {
    run(projection?:IProjection<any>);
    restart(projection?:IProjection<any>);
}

export default IProjectionEngine