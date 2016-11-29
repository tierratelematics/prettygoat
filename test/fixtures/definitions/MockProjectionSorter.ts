import IProjectionSorter from "../../../scripts/projections/IProjectionSorter";

class MockProjectionSorter implements IProjectionSorter {
    sort(): string[] {
        return null;
    }
}

export default MockProjectionSorter