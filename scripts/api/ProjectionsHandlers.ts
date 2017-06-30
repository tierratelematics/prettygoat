import {inject, injectable} from "inversify";
import Dictionary from "../util/Dictionary";
import {IProjectionRunner} from "../projections/IProjectionRunner";
import {IRequestHandler, IRequest, IResponse} from "../web/IRequestComponents";
import Route from "../web/RouteDecorator";
const sizeof = require("object-sizeof");
const humanize = require("humanize");
import IProjectionEngine from "../projections/IProjectionEngine";
import {ISnapshotRepository} from "../snapshots/ISnapshotRepository";
import PushContext from "../push/PushContext";
import {IProjectionRegistry} from "../bootstrap/ProjectionRegistry";

@injectable()
abstract class BaseProjectionHandler implements IRequestHandler {

    handle(request: IRequest, response: IResponse) {

    }

    keyFor(request: IRequest): string {
        return request.params.projectionName;
    }
}

@Route("POST", "/api/projections/stop/:projectionName")
export class ProjectionStopHandler extends BaseProjectionHandler {

    constructor(@inject("IProjectionRunnerHolder") private holders: Dictionary<IProjectionRunner<any>>) {
        super();
    }

    handle(request: IRequest, response: IResponse) {
        try {
            let runner = this.holders[request.params.projectionName];
            runner.stop();
            response.status(204);
            response.end();
        } catch (error) {
            response.status(404);
            response.send({error: "Projection not found or already stopped"});
        }
    }

}

@Route("POST", "/api/projections/restart/:projectionName")
export class ProjectionRestartHandler extends BaseProjectionHandler {

    constructor(@inject("IProjectionRunnerHolder") private holders: Dictionary<IProjectionRunner<any>>,
                @inject("IProjectionRegistry") private registry: IProjectionRegistry,
                @inject("IProjectionEngine") private projectionEngine: IProjectionEngine,
                @inject("ISnapshotRepository") private snapshotRepository: ISnapshotRepository) {
        super();
    }

    async handle(request: IRequest, response: IResponse) {
        try {
            let projectionName = request.params.projectionName,
                entry = this.registry.projectionFor(projectionName),
                runner = this.holders[projectionName];

            if (runner.stats.running)
                runner.stop();

            await this.snapshotRepository.deleteSnapshot(projectionName);
            this.projectionEngine.run(entry[1], new PushContext(entry[0], entry[1].name));
            response.status(204);
            response.send();
        } catch (error) {
            this.writeError(response);
        }
    }

    private writeError(response: IResponse) {
        response.status(404);
        response.send({error: "Projection not found"});
    }

}

@Route("GET", "/api/projections/stats/:projectionName")
export class ProjectionStatsHandler extends BaseProjectionHandler {

    constructor(@inject("IProjectionRunnerHolder") private holders: Dictionary<IProjectionRunner<any>>) {
        super();
    }

    handle(request: IRequest, response: IResponse) {
        try {
            let runner = this.holders[request.params.projectionName];
            let size = sizeof(runner.state);
            response.send({
                name: request.params.projectionName,
                size: size,
                humanizedSize: humanize.filesize(size),
                events: runner.stats.events,
                running: runner.stats.running
            });
        } catch (e) {
            response.status(404);
            response.send({error: "Projection not found"});
        }
    }
}
