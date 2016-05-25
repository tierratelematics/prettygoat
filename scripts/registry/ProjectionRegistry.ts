import IProjectionRegistry from "./IProjectionRegistry";
import AreaRegistry from "./AreaRegistry";
import RegistryEntry from "./RegistryEntry";
import IProjectionDefinition from "./IProjectionDefinition";
import Constants from "./Constants";
import {injectable, inject} from "inversify";
import {ProjectionAnalyzer} from "../projections/ProjectionAnalyzer";

@injectable()
class ProjectionRegistry implements IProjectionRegistry {

    private registry:AreaRegistry[] = [];
    private unregisteredEntries:RegistryEntry<any>[] = [];

    constructor(@inject("ProjectionAnalyzer") private analyzer:ProjectionAnalyzer) {

    }

    master<T>(projection:IProjectionDefinition<T>):AreaRegistry {
        return this.add(projection).forArea(Constants.MASTER_AREA);
    }

    index<T>(projection:IProjectionDefinition<T>):AreaRegistry {
        return this.add(projection).forArea(Constants.INDEX_AREA);
    }

    add<T>(definition:IProjectionDefinition<T>, parameters?:any):IProjectionRegistry {
        let name = Reflect.getMetadata("prettygoat:projection", definition.constructor);
        if (!name)
            throw new Error("Missing Projection decorator");
        let projection = definition.define();
        let validationErrors = this.analyzer.analyze(projection);
        if (validationErrors.length > 0)
            throw new Error(validationErrors[0]);
        this.unregisteredEntries.push(new RegistryEntry<T>(projection, name, parameters));
        return this;
    }

    forArea(area:string):AreaRegistry {
        let areaRegistry = new AreaRegistry(area, this.unregisteredEntries);
        this.registry.push(areaRegistry);
        this.unregisteredEntries = [];
        return areaRegistry;
    }

    getAreas():AreaRegistry[] {
        return this.registry;
    }
}

export default ProjectionRegistry