import * as express from 'express';
import {injectable, inject} from 'inversify';
import Dictionary from "../Dictionary";
import IProjectionRunner from "../projections/IProjectionRunner";
import {interfaces, Controller, Post} from 'inversify-express-utils';
import {ISubject} from "rx";
import {ProjectionRunnerStatus} from "../projections/ProjectionRunnerStatus";

@Controller('/api/projections')
@injectable()
class ProjectionsManagerController implements interfaces.Controller {

    constructor(@inject("IProjectionRunnerHolder") private projectionsRunners: Dictionary<IProjectionRunner<any>>,
                @inject("ProjectionStatuses") private projectionStatuses: ISubject<void>) {
    }

    @Post('/stop')
    stop(request: express.Request, response: express.Response): void {
        try {
            this.projectionsRunners[request.body.payload.name].stop();
            this.projectionStatuses.onNext(null);
            response.status(204).end();
        } catch (e) {
            response.status(400).json({error: "Projection not found or is already stopped"});
        }
    }

    @Post('/pause')
    pause(request: express.Request, response: express.Response): void {
        try {
            this.projectionsRunners[request.body.payload.name].pause();
            this.projectionStatuses.onNext(null);
            response.status(204).end();
        }
        catch (e) {
            response.status(400).json({error: "Projection not found or is not started"});
        }
    }

    @Post('/resume')
    resume(request: express.Request, response: express.Response): void {
        try {
            this.projectionsRunners[request.body.payload.name].resume();
            this.projectionStatuses.onNext(null);
            response.status(204).end();
        }
        catch (e) {
            response.status(400).json({error: "Projection not found or is not paused"});
        }
    }

}

export default ProjectionsManagerController;