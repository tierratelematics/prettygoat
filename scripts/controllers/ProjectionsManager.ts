import * as express from 'express';
import {injectable, inject} from 'inversify';
import Dictionary from "../Dictionary";
import IProjectionRunner from "../projections/IProjectionRunner";
import IProjectionsManager from "./IProjectionsManager";
import { Controller, Get, Post } from 'inversify-express-utils';
import {ProjectionRunnerStatus} from "../projections/ProjectionRunnerStatus";

@Controller('/projections')
@injectable()
class ProjectionsManager implements Controller,IProjectionsManager{

    public status: number;
    public response: Dictionary<any>;

    constructor(
        @inject("IProjectionRunnerHolder") private projectionsRunnerCollection:Dictionary<IProjectionRunner<any>>
    ){
    }

    @Post('/stop')
    stop(req: express.Request, res: express.Response): void {

        let projection:IProjectionRunner<any> = this.getProjectionRunner(req.body.name);
        let operationDone:boolean = true;

        if(projection && projection.status==ProjectionRunnerStatus.Stop)
            projection.stop();
        else
            operationDone = false;

        this.writeResponse(res,projection,req.param("name"),"Stop",operationDone);
    }

    @Get('/pause/:name')
    pause(req: express.Request, res: express.Response): void {
        let projection:IProjectionRunner<any> = this.getProjectionRunner(req.param("name"));
        let operationDone:boolean = true;

        if(projection && projection.status==ProjectionRunnerStatus.Run)
            projection.pause();
        else
            operationDone = false;

        this.writeResponse(res,projection,req.param("name"),"Pause",operationDone);
    }

    @Get('/resume/:name')
    resume(req: express.Request, res: express.Response): void {
        let projection:IProjectionRunner<any> = this.getProjectionRunner(req.param("name"));
        let operationDone:boolean = true;

        if(projection && projection.status==ProjectionRunnerStatus.Pause)
            projection.resume();
        else
            operationDone = false;

        this.writeResponse(res,projection,req.param("name"),"Resume",operationDone);
    }

    private getProjectionRunner(name : string):IProjectionRunner<any>{
        return (this.projectionsRunnerCollection[name]) ? this.projectionsRunnerCollection[name] : null;
    }

    private writeResponse(res:express.Response,projectionRunner:IProjectionRunner<any>,name:string,operation:string,operationDone:boolean) {
        this.status = (projectionRunner) ? 200 : 500;
        this.response = (projectionRunner) ? {name: name, operation: operation} : {error: "Projection "+name+" not found"};

        res.status(this.status).json(this.response);
    }
}

export default ProjectionsManager;