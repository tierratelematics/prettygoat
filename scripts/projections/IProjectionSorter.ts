import Dictionary from "../Dictionary";
import {IProjection} from "./IProjection";

interface IProjectionSorter{
    dependency: Dictionary<any[]>
    getDependecy(projection:IProjection<any>): string[]
    checkCircular(a:IProjection<any>,b:IProjection<any>):boolean
}

export default IProjectionSorter