import {inject, injectable} from "inversify";
import Dictionary from "../util/Dictionary";
import IProjectionRunner from "../projections/IProjectionRunner";
import {IRequestHandler, IRequest, IResponse} from "../web/IRequestComponents";
import Route from "../web/RouteDecorator";
const sizeof = require("object-sizeof");
const humanize = require("humanize");
import * as _ from "lodash";
import SplitProjectionRunner from "../projections/SplitProjectionRunner";
import Base = Mocha.reporters.Base;
import IProjectionEngine from "../projections/IProjectionEngine";
import {ISnapshotRepository} from "../snapshots/ISnapshotRepository";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import PushContext from "../push/PushContext";

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
            response.send();
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

    handle(request: IRequest, response: IResponse) {
        try {
            let projectionName = request.params.projectionName,
                entry = this.registry.getEntry(projectionName),
                runner = this.holders[projectionName];

            if (runner.stats.running)
                runner.stop();

            this.snapshotRepository.deleteSnapshot(projectionName).subscribe(() => {
                this.projectionEngine.run(entry.data.projection, new PushContext(entry.area, entry.data.exposedName));
                response.status(204);
                response.send();
            }, () => this.writeError(response));
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
            let data: any = {
                name: request.params.projectionName,
                size: size,
                humanizedSize: humanize.filesize(size),
                events: runner.stats.events,
                readModels: runner.stats.readModels,
                running: runner.stats.running
            };
            if (runner instanceof SplitProjectionRunner) {
                data.splits = _.keys(runner.state).length;
            }
            response.send(data);
        } catch (e) {
            response.status(404);
            response.send({error: "Projection not found or already in this state"});
        }
    }
}
