import {injectable, inject} from "inversify";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import * as _ from "lodash";
import IDependenciesCollector from "./IDependenciesCollector";
import {IProjection} from "../projections/IProjection";

@injectable()
class DependenciesCollector implements IDependenciesCollector {
    private graph:string[][] = [];

    constructor(@inject("IProjectionRegistry") private registry:IProjectionRegistry) {
    }

    getDependenciesFor(projection:IProjection<any>):string[]{
        return _(projection.definition)
            .keys()
            .filter(projection => this.registry.getEntry(projection, null).data != null)
            .valueOf();
    }

}

export default DependenciesCollector