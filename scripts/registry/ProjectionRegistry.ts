import IProjectionRegistry from "./IProjectionRegistry";
import AreaRegistry from "./AreaRegistry";
import RegistryEntry from "./RegistryEntry";
import IProjectionDefinition from "./IProjectionDefinition";
import Constants from "./Constants";
import {injectable, inject} from "inversify";
import {ProjectionAnalyzer} from "../projections/ProjectionAnalyzer";
import {INewable} from "inversify";
import IObjectContainer from "../bootstrap/IObjectContainer";

@injectable()
class ProjectionRegistry implements IProjectionRegistry {

    private registry:AreaRegistry[] = [];
    private unregisteredEntries:RegistryEntry<any>[] = [];

    constructor(@inject("ProjectionAnalyzer") private analyzer:ProjectionAnalyzer,
                @inject("IObjectContainer") private container:IObjectContainer) {

    }

    master<T>(constructor:INewable<IProjectionDefinition<T>>):AreaRegistry {
        return this.add(constructor).forArea(Constants.MASTER_AREA);
    }

    index<T>(constructor:INewable<IProjectionDefinition<T>>):AreaRegistry {
        return this.add(constructor).forArea(Constants.INDEX_AREA);
    }

    add<T>(constructor:INewable<IProjectionDefinition<T>>, parameters?:any):IProjectionRegistry {
        let name = Reflect.getMetadata("prettygoat:projection", constructor);
        if (!name)
            throw new Error("Missing Projection decorator");
        let projection = this.getDefinitionFromConstructor(constructor, name).define();
        let validationErrors = this.analyzer.analyze(projection);
        if (validationErrors.length > 0)
            throw new Error(validationErrors[0]);
        this.unregisteredEntries.push(new RegistryEntry<T>(projection, name, parameters));
        return this;
    }

    private getDefinitionFromConstructor<T>(constructor:INewable<IProjectionDefinition<T>>, name:string):IProjectionDefinition<T> {
        const key = `prettygoat:definitions:${name}`;
        if (!this.container.contains(key))
            this.container.set(key, constructor);
        return this.container.get<IProjectionDefinition<T>>(key);
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