
import Dictionary from "../Dictionary";
import {injectable, inject} from "inversify";
import IProjectionRunner from "../projections/IProjectionRunner";
import IObjectContainer from "../bootstrap/IObjectContainer";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import * as _ from "lodash";
import AreaRegistry from "../registry/AreaRegistry";
import IProjectionDefinition from "../registry/IProjectionDefinition";
import RegistryEntry from "../registry/RegistryEntry";
import IProjectionSorter from "./IProjectionSorter";
import {IProjection} from "./IProjection";


@injectable()
class ProjectionSorter implements IProjectionSorter{
    dependency: Dictionary<string[]>;

    constructor(@inject("IProjectionRegistry") private registry:IProjectionRegistry
    ){
        this.dependency = {};
    }

    private isProjection(idProjection:string,idArea:string):boolean{
        return this.registry.getEntry(idProjection,idArea).data!=null;
    }

    getDependecy(projection:IProjection<any>): string[]{
        let keys = null;

        if(projection.name.trim()==="" || projection.name=="")
            throw Error("The projection not have a name");

        ////CACHED
        if(this.dependency[projection.name]){
            return this.dependency[projection.name];
        }
        //////NOT DATA
        if(this.registry.getEntry(projection.name,null).data==null){
            this.dependency[projection.name] = [];
            keys = [];
        }
        else{
            _.forEach(this.registry.getEntry(projection.name,null).data, (entry:RegistryEntry<any>) => {
                keys = _.filter(_.keys(entry.projection.definition), (key:string) => {
                    return this.isProjection(key,null);
                });
                this.dependency[projection.name] = keys;
            });
        }

        return keys;
    };

    checkCircular(a:IProjection<any>,b:IProjection<any>):boolean{
        return _.includes(this.getDependecy(a),b.name) && _.includes(this.getDependecy(b), a.name);
    }

}

export default ProjectionSorter