import IProjectionRegistry from "./IProjectionRegistry";
import AreaRegistry from "./AreaRegistry";
import RegistryEntry from "./RegistryEntry";
import IProjectionDefinition from "./IProjectionDefinition";
import Constants from "./Constants";
import {injectable, inject} from "inversify";
import {ProjectionAnalyzer} from "../projections/ProjectionAnalyzer";
import {INewable} from "inversify";
import IObjectContainer from "../bootstrap/IObjectContainer";
import * as _ from "lodash";

@injectable()
class ProjectionRegistry implements IProjectionRegistry {

    private registry:AreaRegistry[] = [];
    private unregisteredEntries:{
        ctor:INewable<IProjectionDefinition<any>>,
        name:string,
        parametersKey?:(parameters:any) => string
    }[] = [];

    constructor(@inject("ProjectionAnalyzer") private analyzer:ProjectionAnalyzer,
                @inject("IObjectContainer") private container:IObjectContainer) {

    }

    master<T>(constructor:INewable<IProjectionDefinition<T>>):AreaRegistry {
        return this.add(constructor).forArea(Constants.MASTER_AREA);
    }

    index<T>(constructor:INewable<IProjectionDefinition<T>>):AreaRegistry {
        return this.add(constructor).forArea(Constants.INDEX_AREA);
    }

    add<T>(constructor:INewable<IProjectionDefinition<T>>, parametersKey?:(parameters:any) => string):IProjectionRegistry {
        let name = Reflect.getMetadata("prettygoat:projection", constructor);
        if (!name)
            throw new Error("Missing Projection decorator");
        this.unregisteredEntries.push({ctor: constructor, name: name, parametersKey: parametersKey});
        return this;
    }

    private getDefinitionFromConstructor<T>(constructor:INewable<IProjectionDefinition<T>>, area:string, name:string):IProjectionDefinition<T> {
        const key = `prettygoat:definitions:${area}:${name}`;
        if (!this.container.contains(key))
            this.container.set(key, constructor);
        return this.container.get<IProjectionDefinition<T>>(key);
    }

    forArea(area:string):AreaRegistry {
        let entries = _.map(this.unregisteredEntries, entry => {
            let projection = this.getDefinitionFromConstructor(entry.ctor, area, entry.name).define();
            let validationErrors = this.analyzer.analyze(projection);
            if (validationErrors.length > 0)
                throw new Error(validationErrors[0]);
            return new RegistryEntry(projection, entry.name, entry.parametersKey);
        });
        let areaRegistry = new AreaRegistry(area, entries);
        this.registry.push(areaRegistry);
        this.unregisteredEntries = [];
        return areaRegistry;
    }

    getAreas():AreaRegistry[] {
        return this.registry;
    }
}

export default ProjectionRegistry