import {IProjection} from "../projections/IProjection";

interface IDependenciesCollector {
    getDependenciesFor(projection: IProjection<any>): string[]
}

export default IDependenciesCollector