import {IProjection} from "./IProjection";
interface IProjectionDependency {
    dependencyList(projection:IProjection<any>):string[]
}

export default IProjectionDependency