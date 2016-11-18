import {IProjection} from "../projections/IProjection";
interface IDependenciesCollector {
    getDependencyCollection(projection:IProjection<any>):string[]
}

export default IDependenciesCollector