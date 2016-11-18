import IDependenciesCollector from "../../scripts/collector/IDependenciesCollector";
import {IProjection} from "../../scripts/projections/IProjection";
import * as _ from "lodash";

class MockDependenciesCollector implements IDependenciesCollector {
    getDependenciesFor(projection: IProjection<any>): string[] {
        return _.keys(projection.definition);
    }
}

export default MockDependenciesCollector