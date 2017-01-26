import {inject} from 'inversify';
import Dictionary from "../util/Dictionary";
import IProjectionRunner from "../projections/IProjectionRunner";
import {ISubject} from "rx";
import {IRequestHandler, IRequest, IResponse} from "../web/IRequestComponents";
import Route from "../web/RouteDecorator";

@Route("POST", "/api/projections/stop")
export class ProjectionStopHandler implements IRequestHandler {

    constructor(@inject("IProjectionRunnerHolder") private projectionsRunners: Dictionary<IProjectionRunner<any>>,
                @inject("ProjectionStatuses") private projectionStatuses: ISubject<void>) {
    }

    handle(request: IRequest, response: IResponse) {
        try {
            this.projectionsRunners[request.body.payload.name].stop();
            this.projectionStatuses.onNext(null);
            response.status(204);
            response.send();
        } catch (e) {
            response.status(404);
            response.send({error: "Projection not found or is already stopped"});
        }
    }

    keyFor(request: IRequest): string {
        return request.body.payload.name;
    }

}

@Route("POST", "/api/projections/pause")
export class ProjectionPauseHandler implements IRequestHandler {

    constructor(@inject("IProjectionRunnerHolder") private projectionsRunners: Dictionary<IProjectionRunner<any>>,
                @inject("ProjectionStatuses") private projectionStatuses: ISubject<void>) {
    }

    handle(request: IRequest, response: IResponse) {
        try {
            this.projectionsRunners[request.body.payload.name].pause();
            this.projectionStatuses.onNext(null);
            response.status(204);
            response.send();
        }
        catch (e) {
            response.status(404);
            response.send({error: "Projection not found or is not started"});
        }
    }

    keyFor(request: IRequest): string {
        return request.body.payload.name;
    }

}

@Route("POST", "/api/projections/resume")
export class ProjectionResumeHandler implements IRequestHandler {

    constructor(@inject("IProjectionRunnerHolder") private projectionsRunners: Dictionary<IProjectionRunner<any>>,
                @inject("ProjectionStatuses") private projectionStatuses: ISubject<void>) {
    }

    handle(request: IRequest, response: IResponse) {
        try {
            this.projectionsRunners[request.body.payload.name].resume();
            this.projectionStatuses.onNext(null);
            response.status(204);
            response.send();
        }
        catch (e) {
            response.status(404);
            response.send({error: "Projection not found or is not paused"});
        }
    }

    keyFor(request: IRequest): string {
        return request.body.payload.name;
    }

}