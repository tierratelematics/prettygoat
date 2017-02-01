import {inject, injectable} from "inversify";
import Dictionary from "../util/Dictionary";
import IProjectionRunner from "../projections/IProjectionRunner";
import {IRequestHandler, IRequest, IResponse} from "../web/IRequestComponents";
import Route from "../web/RouteDecorator";
const sizeof = require("object-sizeof");
const humanize = require("humanize");
import * as _ from "lodash";
import SplitProjectionRunner from "../projections/SplitProjectionRunner";

@injectable()
abstract class BaseProjectionHandler implements IRequestHandler {

    constructor(@inject("IProjectionRunnerHolder") private holder: Dictionary<IProjectionRunner<any>>) {
    }

    handle(request: IRequest, response: IResponse) {
        try {
            let runner = this.holder[request.body.payload.name];
            this.doAction(runner);
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

    constructor(@inject("IProjectionRunnerHolder") holders: Dictionary<IProjectionRunner<any>>) {
        super(holders);
    }

    doAction(runner: IProjectionRunner<any>) {
        runner.stop();
    }

}
@Route("POST", "/api/projections/pause")
export class ProjectionPauseHandler extends BaseProjectionHandler {

    constructor(@inject("IProjectionRunnerHolder") holders: Dictionary<IProjectionRunner<any>>) {
        super(holders);
    }

    doAction(runner: IProjectionRunner<any>) {
        runner.pause();
    }

}

@Route("POST", "/api/projections/resume")
export class ProjectionResumeHandler extends BaseProjectionHandler {

    constructor(@inject("IProjectionRunnerHolder") holders: Dictionary<IProjectionRunner<any>>) {
        super(holders);
    }

    doAction(runner: IProjectionRunner<any>) {
        runner.resume();
    }

}

@Route("GET", "/api/projections/stats/:projectionName")
export class ProjectionStatsHandler implements IRequestHandler {

    constructor(@inject("IProjectionRunnerHolder") private holders: Dictionary<IProjectionRunner<any>>) {

    }

    handle(request: IRequest, response: IResponse) {
        try {
            let runner = this.holders[request.body.payload.name];
            let size = sizeof(runner.state);
            let data:any = {
                size: size,
                humanizedSize: humanize.filesize(size),
                events: runner.stats.events,
                readModels: runner.stats.readModels,
                status: runner.status
            };
            if (runner instanceof SplitProjectionRunner) {
                data.splits = _.keys(runner.state).length;
            }
            response.send(data);
        } catch (e) {
            console.error(e);
            response.status(404);
            response.send({error: "Projection not found or already in this state"});
        }
    }

    keyFor(request: IRequest): string {
        return request.body.payload.name;
    }
}
