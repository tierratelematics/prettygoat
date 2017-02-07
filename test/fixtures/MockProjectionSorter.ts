import IProjectionSorter from "../../scripts/projections/IProjectionSorter";
import {IProjection} from "../../scripts/projections/IProjection";

class MockProjectionSorter implements IProjectionSorter {
    dependencies(projection: IProjection<any>): string[] {
        return undefined;
    }

    dependents(projection: IProjection<any>): string[] {
        return undefined;
    }
    sort(): string[] {
        return null;
    }
}

export default MockProjectionSorter