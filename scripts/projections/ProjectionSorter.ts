import {injectable, inject} from "inversify";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import * as _ from "lodash";
import AreaRegistry from "../registry/AreaRegistry";
import RegistryEntry from "../registry/RegistryEntry";
import IProjectionSorter from "./IProjectionSorter";
const toposort = require("toposort");

@injectable()
class ProjectionSorter implements IProjectionSorter {
    private graph:string[][] = [];

    constructor(@inject("IProjectionRegistry") private registry:IProjectionRegistry) {
    }

    sort():string[] {
        if (!this.graph.length) this.initialize();
        return toposort(this.graph);
    }

    private initialize():void {
        _.forEach(this.registry.getAreas(), (area:AreaRegistry) => {
            _.forEach(area.entries, (entry:RegistryEntry<any>) => {
                let listAjacency = _(entry.projection.definition)
                    .keys()
                    .filter(projection => this.registry.getEntry(projection, null).data != null)
                    .valueOf();
                this.addEdgesFromProjection(listAjacency, entry.projection.name);
            });
        });
    }

    private addEdgesFromProjection(listAdjacency:string[], nodeFrom:string):void {
        _.forEach(listAdjacency, (nodeTo:string) => {
            this.graph.push([nodeFrom, nodeTo]);
        });
    }
}

export default ProjectionSorter