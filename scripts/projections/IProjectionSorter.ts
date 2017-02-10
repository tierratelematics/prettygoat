import {IProjection} from "./IProjection";

interface IProjectionSorter {
    sort(): string[];
    dependencies(projection: IProjection<any>): string[];
    dependents(projection: IProjection<any>): string[];
}

export default IProjectionSorter