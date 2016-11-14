
import IDependencyDefinition from "./IDependencyDefinition";
import Dictionary from "../Dictionary";
import {injectable, inject} from "inversify";
import IProjectionRunner from "../projections/IProjectionRunner";
import IObjectContainer from "../bootstrap/IObjectContainer";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import * as _ from "lodash";
import AreaRegistry from "../registry/AreaRegistry";
import IProjectionDefinition from "../registry/IProjectionDefinition";
import RegistryEntry from "../registry/RegistryEntry";


@injectable()
class DependencyDefinition implements IDependencyDefinition{
    dependency: Dictionary<string[]>;

    constructor(@inject("IProjectionRegistry") private registry:IProjectionRegistry
    ){
        this.dependency = {};
    }

    isProjection(idProjection:string,idArea:string):boolean{
        return this.registry.getEntry(idProjection,idArea).data!=null;
    }

    getDependecyList<T>(): void{
        _.forEach(this.registry.getAreas(), (areaRegistry:AreaRegistry) => {
            _.forEach(areaRegistry.entries, (entry:RegistryEntry<any>) => {
                let keys = _.filter(_.keys(entry.projection.definition), (key:string) => {
                    return this.isProjection(key,null);
                });

                this.dependency[entry.name] = keys;
            })
        });
    };
}

export default DependencyDefinition