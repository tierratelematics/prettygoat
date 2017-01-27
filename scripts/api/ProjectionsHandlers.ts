import {inject, injectable} from "inversify";
import Dictionary from "../util/Dictionary";
import IProjectionRunner from "../projections/IProjectionRunner";
import {ISubject} from "rx";
import {IRequestHandler, IRequest, IResponse} from "../web/IRequestComponents";
import Route from "../web/RouteDecorator";


@injectable()
abstract class BaseProjectionHandler implements IRequestHandler {

    constructor(@inject("IProjectionRunnerHolder") private holder: Dictionary<IProjectionRunner<any>>,
                @inject("ProjectionStatuses") private projectionStatuses: ISubject<void>) {
    }

    handle(request: IRequest, response: IResponse) {
        try {
            let runner = this.holder[request.body.payload.name];
            this.doAction(runner);
            this.projectionStatuses.onNext(null);
            response.status(204);
            response.send();
        } catch (e) {
            console.error(e);
            response.status(404);
            response.send({error: "Projection not found or already in this state"});
        }
    }

    abstract doAction(runner: IProjectionRunner<any>);

    keyFor(request: IRequest): string {
        return request.body.payload.name;
    }
}

@Route("POST", "/api/projections/stop")
export class ProjectionStopHandler extends BaseProjectionHandler {

    constructor(@inject("IProjectionRunnerHolder") holders: Dictionary<IProjectionRunner<any>>,
                @inject("ProjectionStatuses") projectionStatuses: ISubject<void>) {
        super(holders, projectionStatuses);
    }

    doAction(runner: IProjectionRunner<any>) {
        runner.stop();
    }

}
@Route("POST", "/api/projections/pause")
export class ProjectionPauseHandler extends BaseProjectionHandler {

    constructor(@inject("IProjectionRunnerHolder") holders: Dictionary<IProjectionRunner<any>>,
                @inject("ProjectionStatuses") projectionStatuses: ISubject<void>) {
        super(holders, projectionStatuses);
    }

    doAction(runner: IProjectionRunner<any>) {
        runner.pause();
    }

}

@Route("POST", "/api/projections/resume")
export class ProjectionResumeHandler extends BaseProjectionHandler {

    constructor(@inject("IProjectionRunnerHolder") holders: Dictionary<IProjectionRunner<any>>,
                @inject("ProjectionStatuses") projectionStatuses: ISubject<void>) {
        super(holders, projectionStatuses);
    }

    doAction(runner: IProjectionRunner<any>) {
        runner.resume();
    }

}
