import IProjectionHandler from "./IProjectionHandler";
import Event from "../streams/Event";
import AreaRegistry from "../registry/AreaRegistry";

interface IProjectionSelector {
    addProjections(areaRegistry:AreaRegistry):IProjectionHandler<any>[];
    projectionsFor(event:Event<any>):IProjectionHandler<any>[];
    projectionFor(area:string, projectionName:string, splitKey?:string):IProjectionHandler<any>;
}

export default IProjectionSelector