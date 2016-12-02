import * as express from 'express';
import {injectable, inject} from 'inversify';
import Dictionary from "../Dictionary";
import IProjectionRunner from "../projections/IProjectionRunner";
import IProjectionsManager from "./IProjectionsManager";
import { Controller, Get, Post } from 'inversify-express-utils';
import {ProjectionRunner} from "../projections/ProjectionRunner";

@Controller('/projections')
@injectable()
class ProjectionsManager implements Controller,IProjectionsManager{

    constructor(@inject("IProjectionRunnerHolder") private projectionsRunnerCollection:Dictionary<IProjectionRunner<any>>){

    }

    @Post('/stop')
    stop(req: express.Request, res: express.Response): void {
        let projection:IProjectionRunner<any> = this.getProjectionRunner(req.body.name);

        if(projection)
            projection.stop();

        this.writeResponse(res,projection,req.body.name,"Stop");
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

    private stop(){

    }

    private getProjectionRunner(name : string):IProjectionRunner<any>{
        return (this.projectionsRunnerCollection[name]) ? this.projectionsRunnerCollection[name] : null;
    }

    private writeResponse(res:express.Response,projectionRunner:IProjectionRunner<any>,name:string,operation:string){
        if(projectionRunner)
            res.json({name: name, operation: operation});
        else
            res.status(500).json({error: "Projection "+name+" not found"});
    }

}

export default ProjectionsManager;