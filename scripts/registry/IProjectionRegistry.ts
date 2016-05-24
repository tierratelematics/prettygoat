import RegistryEntry from "./RegistryEntry";
import AreaRegistry from "./AreaRegistry";
import {IProjection} from "../interfaces/IProjection";
import PushContext from "../push/PushContext";

interface IProjectionRegistry {
    master<T>(projection:IProjection<T>):AreaRegistry;
    index<T>(projection:IProjection<T>):AreaRegistry;
    add<T>(projection:IProjection<T>, context:PushContext):IProjectionRegistry;
    forArea(area:string):AreaRegistry;
    getArea(areaId:string):AreaRegistry;
    getAreas():AreaRegistry[];
    getEntry<T>(area:string, id:string):RegistryEntry<T>;
}

export default IProjectionRegistry;
