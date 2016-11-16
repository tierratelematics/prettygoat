
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
export default class ProjectionSorter implements IProjectionSorter{
    topologicGraph: string[][] = [];

    constructor(@inject("IProjectionRegistry") private registry:IProjectionRegistry,
                @inject("ToposortService") private topologicService:any
    ){
        this.getDependency();
    }

    topologicSort():string[]{
        let result:string[] = this.topologicService(this.topologicGraph);
        return result;
    }

    private isProjection(idProjection:string,idArea:string):boolean{
        return this.registry.getEntry(idProjection,idArea).data!=null;
    }

    private getDependency():void{
        let keys = null;
        _.forEach(this.registry.getAreas(), (area:AreaRegistry) => {
            _.forEach(area.entries, (projection:RegistryEntry<any>) => {
                keys = _.filter(_.keys(projection.projection.definition), (key:string) => {
                    return this.isProjection(key,null);
                });
                this.graphConstruction(keys,projection.name);
            });
        });
    }

    private graphConstruction(listAdjacency:string[], nodeFrom: string):void{
        _.forEach(listAdjacency, (nodeTo:string) => {
            this.topologicGraph.push([nodeFrom,nodeTo]);
        });
    }
}