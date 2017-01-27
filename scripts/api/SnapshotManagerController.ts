import {inject} from "inversify";
import Dictionary from "../util/Dictionary";
import IProjectionRunner from "../projections/IProjectionRunner";
import {ISnapshotRepository, Snapshot} from "../snapshots/ISnapshotRepository";
import IDateRetriever from "../util/IDateRetriever";
import Route from "../web/RouteDecorator";
import {IRequestHandler, IRequest, IResponse} from "../web/IRequestComponents";

@Route("POST", "/api/snapshots/save")
export class SnapshotSaveHandler implements IRequestHandler {

    constructor(@inject("IProjectionRunnerHolder") private holder: Dictionary<IProjectionRunner<any>>,
                @inject("ISnapshotRepository") private snapshotRepository: ISnapshotRepository,
                @inject("IDateRetriever") private dateRetriever: IDateRetriever) {
    }

    handle(request: IRequest, response: IResponse) {
        let projection = this.holder[request.body.payload.name];

        if (!projection) {
            response.status(404);
            response.send({error: "Projection not found"});
            return;
        }

        this.snapshotRepository.saveSnapshot(request.body.payload.name, new Snapshot(projection.state, this.dateRetriever.getDate()));
        response.send({name: request.body.payload.name});
    }

    keyFor(request: IRequest): string {
        return request.body.payload.name;
    }

}

@Route("POST", "/api/snapshots/delete")
export class SnapshotDeleteHandler implements IRequestHandler {

    constructor(@inject("IProjectionRunnerHolder") private holder: Dictionary<IProjectionRunner<any>>,
                @inject("ISnapshotRepository") private snapshotRepository: ISnapshotRepository) {
    }

    handle(request: IRequest, response: IResponse) {
        let projection = this.holder[request.body.payload.name];

        if (!projection) {
            response.status(400).json({error: "Projection not found"});
            return;
        }

        this.snapshotRepository.deleteSnapshot();
        response.send({name: request.body.payload.name});
    }

    keyFor(request: IRequest): string {
        return request.body.payload.name;
    }

}