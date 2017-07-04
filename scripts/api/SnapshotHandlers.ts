import {inject} from "inversify";
import Dictionary from "../common/Dictionary";
import {IProjectionRunner} from "../projections/IProjectionRunner";
import {ISnapshotRepository, Snapshot} from "../snapshots/ISnapshotRepository";
import IDateRetriever from "../common/IDateRetriever";
import Route from "../web/RouteDecorator";
import {IRequestHandler, IRequest, IResponse} from "../web/IRequestComponents";

@Route("POST", "/api/snapshots/save/:projectionName")
export class SnapshotSaveHandler implements IRequestHandler {

    constructor(@inject("IProjectionRunnerHolder") private holder: Dictionary<IProjectionRunner<any>>,
                @inject("ISnapshotRepository") private snapshotRepository: ISnapshotRepository,
                @inject("IDateRetriever") private dateRetriever: IDateRetriever) {
    }

    handle(request: IRequest, response: IResponse) {
        let name = request.params.projectionName;
        let projection = this.holder[name];

        if (!projection) {
            response.status(404);
            response.send({error: "Projection not found"});
            return;
        }

        this.snapshotRepository.saveSnapshot(name, new Snapshot(projection.state, this.dateRetriever.getDate()));
        response.send({name: name});
    }

    keyFor(request: IRequest): string {
        return request.params.projectionName;
    }

}

@Route("POST", "/api/snapshots/delete/:projectionName")
export class SnapshotDeleteHandler implements IRequestHandler {

    constructor(@inject("IProjectionRunnerHolder") private holder: Dictionary<IProjectionRunner<any>>,
                @inject("ISnapshotRepository") private snapshotRepository: ISnapshotRepository) {
    }

    handle(request: IRequest, response: IResponse) {
        let name = request.params.projectionName;
        let projection = this.holder[name];

        if (!projection) {
            response.status(404);
            response.send({error: "Projection not found"});
            return;
        }

        this.snapshotRepository.deleteSnapshot(name);
        response.send({name: name});
    }

    keyFor(request: IRequest): string {
        return request.params.projectionName;
    }

}