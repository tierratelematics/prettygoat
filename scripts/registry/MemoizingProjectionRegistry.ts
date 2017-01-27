import IProjectionRegistry from "./IProjectionRegistry";
import {inject, interfaces} from "inversify";
import IProjectionDefinition from "./IProjectionDefinition";
import AreaRegistry from "./AreaRegistry";
import RegistryEntry from "./RegistryEntry";
import Dictionary from "../util/Dictionary";

class MemoizingProjectionRegistry implements IProjectionRegistry {

    private cache: Dictionary<{area: string; data: RegistryEntry<any>}> = {};

    constructor(@inject("ProjectionRegistry") private registry: IProjectionRegistry) {

    }

    master<T>(constructor: interfaces.Newable<IProjectionDefinition<T>>): AreaRegistry {
        return this.registry.master(constructor);
    }

    index<T>(constructor: interfaces.Newable<IProjectionDefinition<T>>): AreaRegistry {
        return this.registry.index(constructor);
    }

    add<T>(constructor: interfaces.Newable<IProjectionDefinition<T>>, parametersKey?: (parameters: any) => string): IProjectionRegistry {
        return this.registry.add(constructor, parametersKey);
    }

    forArea(area: string): AreaRegistry {
        return this.registry.forArea(area);
    }

    getAreas(): AreaRegistry[] {
        return this.registry.getAreas();
    }

    getArea(areaId: string): AreaRegistry {
        return this.registry.getArea(areaId);
    }

    getEntry<T>(id: string, area?: string): {area: string; data: RegistryEntry<T>} {
        let cachedEntry = this.cache[id + area];
        if (!cachedEntry) {
            this.cache[id + area] = cachedEntry = this.registry.getEntry(id, area);
        }
        return cachedEntry;
    }

}

export default MemoizingProjectionRegistry