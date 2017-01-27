import IProjectionSorter from "./IProjectionSorter";
import {inject, injectable} from "inversify";
import {IProjection} from "./IProjection";
import Dictionary from "../util/Dictionary";

@injectable()
class MemoizingProjectionSorter implements IProjectionSorter {

    private cache:Dictionary<string[]> = {};

    constructor(@inject("ProjectionSorter") private sorter:IProjectionSorter) {

    }

    sort(): string[] {
        return this.sorter.sort();
    }

    dependencies(projection: IProjection<any>): string[] {
        return this.sorter.dependencies(projection);
    }

    dependents(projection: IProjection<any>): string[] {
        let cachedEntry = this.cache[projection.name];
        if (!cachedEntry) {
            this.cache[projection.name] = cachedEntry = this.sorter.dependents(projection);
        }
        return cachedEntry;
    }

}

export default MemoizingProjectionSorter