import IProjectionRegistry from "./IProjectionRegistry";
import {IProjection} from "../interfaces/IProjection";
import AreaRegistry from "./AreaRegistry";
import PushContext from "../push/PushContext";
import RegistryEntry from "./RegistryEntry";

class ProjectionRegistry implements IProjectionRegistry {
    
    master<T>(projection:IProjection<T>):AreaRegistry {
        return undefined;
    }

    index<T>(projection:IProjection<T>):AreaRegistry {
        return undefined;
    }

    add<T>(projection:IProjection<T>, context:PushContext):IProjectionRegistry {
        return undefined;
    }

    forArea(area:string):AreaRegistry {
        return undefined;
    }

    getArea(areaId:string):AreaRegistry {
        return undefined;
    }

    getAreas():AreaRegistry[] {
        return undefined;
    }

    getEntry<T>(area:string, id:string):RegistryEntry<T> {
        return undefined;
    }

}

export default ProjectionRegistry