import AreaRegistry from "./AreaRegistry";
import IProjectionDefinition from "./IProjectionDefinition";
import {INewable} from "inversify";
import RegistryEntry from "./RegistryEntry";

interface IProjectionRegistry {
    master<T>(constructor:INewable<IProjectionDefinition<T>>):AreaRegistry;
    index<T>(constructor:INewable<IProjectionDefinition<T>>):AreaRegistry;
    add<T>(constructor:INewable<IProjectionDefinition<T>>, parametersKey?:(parameters:any) => string):IProjectionRegistry;
    forArea(area:string):AreaRegistry;
    getAreas():AreaRegistry[];
    getArea(areaId: string): AreaRegistry;
    getEntry<T>(id:string, area?:string):{ area:string, data:RegistryEntry<T>};
}

export default IProjectionRegistry;
