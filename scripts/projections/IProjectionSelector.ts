import IProjectionRunner from "./IProjectionRunner";
import Event from "../streams/Event";

interface IProjectionSelector {
    initialize():void;
    projectionsFor(event:Event):IProjectionRunner<any>[];
    projectionFor(area:string, projectionName:string, splitKey:string):IProjectionRunner<any>;
}

export default IProjectionSelector