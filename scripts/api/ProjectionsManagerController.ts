import * as express from 'express';
import {injectable, inject} from 'inversify';
import Dictionary from "../Dictionary";
import IProjectionRunner from "../projections/IProjectionRunner";
import {Controller, Get, Post} from 'inversify-express-utils';
import {ProjectionRunnerStatus} from "../projections/ProjectionRunnerStatus";

@Controller('/projections')
@injectable()
class ProjectionsManagerController implements Controller {

    constructor(@inject("IProjectionRunnerHolder") private projectionsRunnerCollection: Dictionary<IProjectionRunner<any>>) {
    }

    @Post('/stop')
    stop(request: express.Request, response: express.Response): void {

        let projection: IProjectionRunner<any> = this.getProjectionRunner(request.body.name);

        if (!projection || projection.status == ProjectionRunnerStatus.Stop) {
            response.status(400).json({error: "Projection not found or already stopped"});
            return;
        }

        projection.stop();
        this.writeResponse(response, request.body.name, "Stop");
    }

    @Post('/pause')
    pause(request: express.Request, response: express.Response): void {
        let projection: IProjectionRunner<any> = this.getProjectionRunner(request.body.name);

        if (!projection || projection.status != ProjectionRunnerStatus.Run) {
            response.status(400).json({error: "Projection not found or not runned"});
            return;
        }

        projection.pause();
        this.writeResponse(response, request.body.name, "Pause");
    }

    @Post('/resume')
    resume(request: express.Request, response: express.Response): void {
        let projection: IProjectionRunner<any> = this.getProjectionRunner(request.body.name);

        if (!projection || projection.status != ProjectionRunnerStatus.Pause) {
            response.status(400).json({error: "Projection not found or not paused"});
            return;
        }

        this.writeResponse(response, request.body.name, "Resume");
    }

    private getProjectionRunner(name: string): IProjectionRunner<any> {
        return (this.projectionsRunnerCollection[name]) ? this.projectionsRunnerCollection[name] : null;
    }

    private writeResponse(response: express.Response, name: string, operation: string) {
        response.status(200).json({name: name, operation: operation});
    }
}

export default ProjectionsManagerController;