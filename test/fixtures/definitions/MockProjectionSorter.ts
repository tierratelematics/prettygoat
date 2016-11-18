import IProjectionSorter from "../../../scripts/projections/IProjectionSorter";

class MockDependenciesCollector implements IProjectionSorter {
    sort(): string[] {
        return null;
    }
}

export default MockDependenciesCollector