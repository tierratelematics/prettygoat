import IProjectionRunner from "./IProjectionRunner";
import Event from "../streams/Event";
import AreaRegistry from "../registry/AreaRegistry";

interface IProjectionSelector {
    addProjections(areaRegistry:AreaRegistry):IProjectionRunner<any>[];
    projectionsFor(event:Event):IProjectionRunner<any>[];
    projectionFor(area:string, projectionName:string, splitKey?:string):IProjectionRunner<any>;
}

export default IProjectionSelector