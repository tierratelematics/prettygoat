import IProjectionSelector from "./IProjectionSelector";
import IProjectionRunner from "./IProjectionRunner";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import IProjectionRunnerFactory from "./IProjectionRunnerFactory";
import Event from "../streams/Event";

class ProjectionSelector implements IProjectionSelector {

    constructor(private projectionRegistry:IProjectionRegistry, private projectionRunnerFactory:IProjectionRunnerFactory) {

    }

    initialize():void {

    }

    projectionsFor(event:Event):IProjectionRunner<any>[] {
        return null;
    }

    projectionFor(area:string, projectionName:string, splitKey:string):IProjectionRunner<any> {
        return null;
    }
}

export default ProjectionSelector