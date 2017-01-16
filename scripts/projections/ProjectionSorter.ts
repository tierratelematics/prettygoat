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

    sort(projection?: IProjection<any>): string[] {
        this.graph = [];
        return (projection) ? this.sortOf(projection) : this.globalSort();
    }

    private sortOf(projection?: IProjection<any>): string[] {
        this.edgesOf(projection);
        return _.filter(toposort(this.graph), (p: string) => p != projection.name);
    }

    private globalSort(): string[] {
        this.initializeGraph();
        return toposort(this.graph);
    }

    private initializeGraph(): void {
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