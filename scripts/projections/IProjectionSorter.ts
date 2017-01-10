import {IProjection} from "./IProjection";

interface IProjectionSorter {
    sort(projection?: IProjection<any>):string[]
}

export default IProjectionSorter