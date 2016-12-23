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

    constructor(@inject("IProjectionRunnerHolder") private projectionsRunnerCollection: Dictionary<IProjectionRunner<any>>,
                @inject("SubjectProjectionStatus") private subjectProjectionStatus: ISubject<string>) {
    }

    @Post('/stop')
    stop(request: express.Request, response: express.Response): void {
        try {
            this.getProjectionRunner(request.body.payload.name).stop();
            this.subjectProjectionStatus.onNext(ProjectionRunnerStatus.Stop);
            this.writeResponse(response, request.body.payload.name, "Stop");
        } catch (e) {
            response.status(400).json({error: "Projection not found or is already stopped"});
        }
    }

    @Post('/pause')
    pause(request: express.Request, response: express.Response): void {
        try {
            this.getProjectionRunner(request.body.payload.name).pause();
            this.subjectProjectionStatus.onNext(ProjectionRunnerStatus.Pause);
            this.writeResponse(response, request.body.payload.name, "Pause");
        }
        catch (e) {
            response.status(400).json({error: "Projection not found or is not started"});
        }
    }

    @Post('/resume')
    resume(request: express.Request, response: express.Response): void {
        try {
            this.getProjectionRunner(request.body.payload.name).resume();
            this.subjectProjectionStatus.onNext(ProjectionRunnerStatus.Run);
            this.writeResponse(response, request.body.payload.name, "Resume");
        }
        catch (e) {
            response.status(400).json({error: "Projection not found or is not paused"});
        }
    }

    private getProjectionRunner(name: string): IProjectionRunner<any> {
        return this.projectionsRunnerCollection[name];
    }

    private writeResponse(response: express.Response, name: string, operation: string) {
        response.json({name: name, operation: operation});
    }
}

export default ProjectionsManagerController;