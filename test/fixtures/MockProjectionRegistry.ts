import IProjectionRegistry from "../../scripts/registry/IProjectionRegistry";
import AreaRegistry from "../../scripts/registry/AreaRegistry";
import IProjectionDefinition from "../../scripts/registry/IProjectionDefinition";
import {interfaces} from "inversify";
import Constants from "../../scripts/registry/Constants";
import _ = require("lodash");
import Dictionary from "../../scripts/Dictionary";
import RegistryEntry from "../../scripts/registry/RegistryEntry";
import MockObjectContainer from "./MockObjectContainer";

export class MockProjectionRegistry implements IProjectionRegistry {
    private registry:AreaRegistry[] = [];
    private unregisteredEntries:{
        ctor:interfaces.Newable<IProjectionDefinition<any>>,
        name:string,
        parametersKey?:(parameters:any) => string
    }[] = [];

    private container:MockObjectContainer = new MockObjectContainer();

    master<T>(constructor:interfaces.Newable<IProjectionDefinition<T>>):AreaRegistry{
        return this.add(constructor).forArea(Constants.MASTER_AREA);
    };

    index<T>(constructor:interfaces.Newable<IProjectionDefinition<T>>):AreaRegistry{
        return this.add(constructor).forArea(Constants.INDEX_AREA);
    }

    add<T>(constructor:interfaces.Newable<IProjectionDefinition<T>>, parametersKey?:(parameters:any) => string):IProjectionRegistry{
        let name = Reflect.getMetadata("prettygoat:projection", constructor);
        this.unregisteredEntries.push({ctor: constructor, name: name, parametersKey: parametersKey});
        return this;
    };

    private getDefinitionFromConstructor<T>(constructor:interfaces.Newable<IProjectionDefinition<T>>, area:string, name:string):IProjectionDefinition<T> {
        const key = `prettygoat:definitions:${area}:${name}`;
        if (!this.container.contains(key))
            this.container.set(key, constructor);
        return this.container.get<IProjectionDefinition<T>>(key);
    }

    forArea(area:string):AreaRegistry{
        let entries = _.map(this.unregisteredEntries, entry => {
            let projection = this.getDefinitionFromConstructor(entry.ctor, area, entry.name).define();
            return new RegistryEntry(projection, entry.name, entry.parametersKey);
        });
        let areaRegistry = new AreaRegistry(area, entries);
        this.registry.push(areaRegistry);
        return areaRegistry;
    };

    getAreas():AreaRegistry[]{
        return this.registry;
    };

    getArea(areaId: string): AreaRegistry{
        return _.find(this.registry, (entry:AreaRegistry) => entry.area.toLowerCase() === areaId.toLowerCase());
    };

    getEntry<T>(id:string, area?:string):{ area:string, data:RegistryEntry<T>}{
        let entry = null;
        if (area) {
            let areaRegistry = this.getArea(area);
            entry = _.find(areaRegistry.entries, (entry:RegistryEntry<any>) => entry.name.toLowerCase() === id.toLowerCase());
            area = areaRegistry.area;
        } else {
            let areas = this.getAreas();
            _.forEach(areas, (areaRegistry:AreaRegistry) => {
                if (!entry)
                    entry = _.find(areaRegistry.entries, (entry:RegistryEntry<any>) => entry.projection.name.toLowerCase() === id.toLowerCase());
            });
        }
        return {
            area: area,
            data: entry
        };
    };
}