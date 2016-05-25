import AreaRegistry from "./AreaRegistry";
import IProjectionDefinition from "./IProjectionDefinition";

interface IProjectionRegistry {
    master<T>(projection:IProjectionDefinition<T>):AreaRegistry;
    index<T>(projection:IProjectionDefinition<T>):AreaRegistry;
    add<T>(projection:IProjectionDefinition<T>, parameters?:any):IProjectionRegistry;
    forArea(area:string):AreaRegistry;
    getAreas():AreaRegistry[];
}

export default IProjectionRegistry;
