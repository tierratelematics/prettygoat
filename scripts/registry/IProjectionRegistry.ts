import AreaRegistry from "./AreaRegistry";
import IProjectionDefinition from "./IProjectionDefinition";
import {INewable} from "inversify";

interface IProjectionRegistry {
    master<T>(constructor:INewable<IProjectionDefinition<T>>):AreaRegistry;
    index<T>(constructor:INewable<IProjectionDefinition<T>>):AreaRegistry;
    add<T>(constructor:INewable<IProjectionDefinition<T>>, parametersKey?:(parameters:any) => string):IProjectionRegistry;
    forArea(area:string):AreaRegistry;
    getAreas():AreaRegistry[];
}

export default IProjectionRegistry;
