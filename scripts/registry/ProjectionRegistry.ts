import IProjectionRegistry from "./IProjectionRegistry";
import AreaRegistry from "./AreaRegistry";
import RegistryEntry from "./RegistryEntry";
import * as _ from "lodash";
import IProjectionDefinition from "./IProjectionDefinition";

class ProjectionRegistry implements IProjectionRegistry {

    private registry:AreaRegistry[] = [];
    private unregisteredEntries:RegistryEntry<any>[] = [];

    master<T>(projection:IProjectionDefinition<T>):AreaRegistry {
        //return this.add(construct, observable).forArea(Area.Master);
        return null;
    }

    index<T>(projection:IProjectionDefinition<T>):AreaRegistry {
        return undefined;
    }

    add<T>(projection:IProjectionDefinition<T>, parameters?:any):IProjectionRegistry {
        /* let id = Reflect.getMetadata("ninjagoat:viewmodel", construct);
         if (!id)
         throw new Error("Missing ViewModel decorator");
         this.unregisteredEntries.push(new RegistryEntry<T>(construct, id, observable, parameters));
         return this;*/
        return null;
    }

    forArea(area:string):AreaRegistry {
        _.remove(this.registry, (entry:AreaRegistry) => entry.area === area);
        let areaRegistry = new AreaRegistry(area, this.unregisteredEntries);
        this.registry.push(areaRegistry);
        this.unregisteredEntries = [];
        return areaRegistry;
    }
}

export default ProjectionRegistry