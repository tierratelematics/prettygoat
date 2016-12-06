import * as express from 'express';
import {injectable, inject} from 'inversify';
import Dictionary from "../Dictionary";
import IProjectionRunner from "../projections/IProjectionRunner";
import {Controller, Get, Post} from 'inversify-express-utils';

@Controller('/api/projections')
@injectable()
class ProjectionsManagerController implements Controller {

    constructor(@inject("IProjectionRunnerHolder") private projectionsRunnerCollection: Dictionary<IProjectionRunner<any>>) {
    }

    @Post('/stop')
    stop(request: express.Request, response: express.Response): void {
        try {
            this.getProjectionRunner(request.body.name).stop();
        } catch (e) {
            response.status(400).json({error: "Projection not found or is already stopped"});
        }
        this.writeResponse(response, request.body.name, "Stop");
    }

    @Post('/pause')
    pause(request: express.Request, response: express.Response): void {
        try {
            this.getProjectionRunner(request.body.name).pause();
        }
        catch (e) {
            response.status(400).json({error: "Projection not found or is not started"});
        }
        this.writeResponse(response, request.body.name, "Pause");
    }

    @Post('/resume')
    resume(request: express.Request, response: express.Response): void {
        try {
            this.getProjectionRunner(request.body.name).resume();
        }
        catch (e) {
            response.status(400).json({error: "Projection not found or is not paused"});
        }
        this.writeResponse(response, request.body.name, "Resume");
    }

    private getProjectionRunner(name: string): IProjectionRunner<any> {
        return this.projectionsRunnerCollection[name];
    }

    private writeResponse(response: express.Response, name: string, operation: string) {
        response.json({name: name, operation: operation});
    }
}

export default ProjectionsManagerController;