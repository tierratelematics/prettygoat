import * as express from 'express';
import {injectable, inject} from 'inversify';
import Dictionary from "../Dictionary";
import IProjectionRunner from "../projections/IProjectionRunner";
import IProjectionsManager from "./IProjectionsManager";
import {Controller,Get} from "inversify-express-utils";

@Controller('/projections')
@injectable()
class ProjectionsManager implements IProjectionsManager{
    constructor(@inject("IProjectionRunnerHolder") private projectionsRunnerCollection:Dictionary<IProjectionRunner<any>>){
    }

    @Get('/stop/:name')
    stop(req: express.Request, res: express.Response): void {
        let projection:IProjectionRunner<any> = this.getProjectionRunner(req.params.name);

        if(projection)
            projection.stop();

        this.writeResponse(res,projection,req.params.name,"Stop");
    }

    @Get('/pause/:name')
    pause(req: express.Request, res: express.Response): void {
        let projection:IProjectionRunner<any> = this.getProjectionRunner(req.params.name);

        if(projection)
            projection.pause();

        this.writeResponse(res,projection,req.params.name,"Pause");
    }

    @Get('/resume/:name')
    resume(req: express.Request, res: express.Response): void {

        let projection:IProjectionRunner<any> = this.getProjectionRunner(req.params.name);

        if(projection)
            projection.resume();

        this.writeResponse(res,projection,req.params.name,"Resume");
    }

    private getProjectionRunner(name : string){
        return (this.projectionsRunnerCollection[name]) ? this.projectionsRunnerCollection[name] : null;
    }

    private writeResponse(res:express.Response,projectionRunner:IProjectionRunner<any>,name:string,operation:string){
        if(projectionRunner)
            res.json({name: name, operation: operation});
        else
            res.status(500).json({error: "Projection not found"});
    }

}

export default ProjectionsManager;