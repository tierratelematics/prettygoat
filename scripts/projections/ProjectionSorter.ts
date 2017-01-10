import {injectable, inject} from "inversify";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import * as _ from "lodash";
import AreaRegistry from "../registry/AreaRegistry";
import RegistryEntry from "../registry/RegistryEntry";
import IProjectionSorter from "./IProjectionSorter";
import {IProjection} from "./IProjection";
const toposort = require("toposort");

@injectable()
class ProjectionSorter implements IProjectionSorter {
    private graph: string[][] = [];

    constructor(@inject("IProjectionRegistry") private registry: IProjectionRegistry) {
    }

    sort(nameProjection?: string): string[] {
        this.graph = [];

        if (nameProjection) {
            let projection: IProjection<any> = this.registry.getEntry(nameProjection, null).data.projection;
            if (!projection)
                throw Error("No projection found with this name");

            this.edgesOf(projection);
        } else {
            this.initialize();
        }

        return toposort(this.graph);
    }

    private initialize(): void {
        _.forEach(this.registry.getAreas(), (area: AreaRegistry) => {
            _.forEach(area.entries, (entry: RegistryEntry<any>) => {
                this.edgesOf(entry.projection);
            });
        });
    }

    private edgesOf(projection: IProjection<any>) {
        let listAdjacency = _(projection.definition)
            .keys()
            .filter(projection => this.registry.getEntry(projection, null).data != null)
            .valueOf();
        this.addEdgesFromProjection(listAdjacency, projection.name);
    }

    private addEdgesFromProjection(listAdjacency: string[], nodeFrom: string): void {
        _.forEach(listAdjacency, (nodeTo: string) => {
            this.graph.push([nodeFrom, nodeTo]);
        });
    }

}

export default ProjectionSorter