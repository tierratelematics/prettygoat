import {inject} from "inversify";
import Dictionary from "../common/Dictionary";
import {IProjectionRunner} from "../projections/IProjectionRunner";
import {ISnapshotRepository, Snapshot} from "../snapshots/ISnapshotRepository";
import IDateRetriever from "../common/IDateRetriever";
import Route from "../web/RouteDecorator";
import {IRequestHandler, IRequest, IResponse} from "../web/IRequestComponents";
import { LoggingContext, NullLogger, ILogger } from "inversify-logging";

@Route("/api/snapshots/save", "POST")
@LoggingContext("SnapshotSaveHandler")
export class SnapshotSaveHandler implements IRequestHandler {

    @inject("ILogger") private logger: ILogger = NullLogger;

    constructor(@inject("IProjectionRunnerHolder") private holder: Dictionary<IProjectionRunner<any>>,
                @inject("ISnapshotRepository") private snapshotRepository: ISnapshotRepository,
                @inject("IDateRetriever") private dateRetriever: IDateRetriever) {
    }

    async handle(request: IRequest, response: IResponse) {
        let name = request.body.payload.projectionName;
        let projection = this.holder[name];
        let logger = this.logger.createChildLogger(name);

        if (!projection) {
            response.status(404);
            response.send({error: "Projection not found"});
            return;
        }

        try {
            await this.snapshotRepository.saveSnapshot(name, new Snapshot(projection.state, this.dateRetriever.getDate()));
            response.send({name: name});
            logger.info("Snapshot saved");
        }  catch (error) {
            logger.error(error);
            response.status(500);
            response.send({error: "Error while saving the snapshot"});
        }
    }

    keyFor(request: IRequest): string {
        return request.params.projectionName;
    }

}

@Route("/api/snapshots/delete", "POST")
@LoggingContext("SnapshotDeleteHandler")
export class SnapshotDeleteHandler implements IRequestHandler {
    
    @inject("ILogger") private logger: ILogger = NullLogger;

    constructor(@inject("IProjectionRunnerHolder") private holder: Dictionary<IProjectionRunner<any>>,
                @inject("ISnapshotRepository") private snapshotRepository: ISnapshotRepository) {
    }

    async handle(request: IRequest, response: IResponse) {
        let name = request.body.payload.projectionName;
        let logger = this.logger.createChildLogger(name);
        let projection = this.holder[name];

        if (!projection) {
            response.status(404);
            response.send({error: "Projection not found"});
            return;
        }

        try { 
            await this.snapshotRepository.deleteSnapshot(name);
            response.send({name: name});
            logger.info("Snapshot deleted");
        } catch (error) {
            logger.error(error);
            response.status(500);
            response.send({error: "Error while saving the snapshot"});
        }
    }

    keyFor(request: IRequest): string {
        return request.params.projectionName;
    }

}