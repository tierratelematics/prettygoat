import IProjectionRegistry from "../../scripts/registry/IProjectionRegistry";
import IProjectionDefinition from "../../scripts/registry/IProjectionDefinition";
import AreaRegistry from "../../scripts/registry/AreaRegistry";
import RegistryEntry from "../../scripts/registry/RegistryEntry";
import {interfaces} from "inversify";

export default class MockProjectionRegistry implements IProjectionRegistry {
    master<T>(constructor:interfaces.Newable<IProjectionDefinition<T>>):AreaRegistry {
        return undefined;
    }

    index<T>(constructor:interfaces.Newable<IProjectionDefinition<T>>):AreaRegistry {
        return undefined;
    }

    add<T>(constructor:interfaces.Newable<IProjectionDefinition<T>>, parametersKey?:(parameters:any)=>string):IProjectionRegistry {
        return undefined;
    }

    forArea(area:string):AreaRegistry {
        return undefined;
    }

    getAreas():AreaRegistry[] {
        return undefined;
    }

    getArea(areaId:string):AreaRegistry {
        return undefined;
    }

    getEntry<T>(id:string, area?:string):{area:string; data:RegistryEntry<T>} {
        return undefined;
    }

}