
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
    }

    topologicSort():string[]{
        this.getDependency();
        return this.topologicService(this.topologicGraph);
    }

    private isProjection(idProjection:string,idArea:string):boolean{
        return this.registry.getEntry(idProjection,idArea).data!=null;
    }

    private getDependency():void{
        let listAjacency = null;
        _.forEach(this.registry.getAreas(), (area:AreaRegistry) => {
            _.forEach(area.entries, (projection:RegistryEntry<any>) => {
                listAjacency = _.filter(_.keys(projection.projection.definition), (projectionDepencency:string) => {
                    return this.isProjection(projectionDepencency,null);
                });
                this.graphConstruction(listAjacency,projection.name);
            });
        });
    }

    private graphConstruction(listAdjacency:string[], nodeFrom: string):void{
        _.forEach(listAdjacency, (nodeTo:string) => {
            this.topologicGraph.push([nodeFrom,nodeTo]);
        });
    }
}