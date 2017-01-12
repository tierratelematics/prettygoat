import * as express from 'express';
import {injectable, inject} from 'inversify';
import Dictionary from "../Dictionary";
import IProjectionRunner from "../projections/IProjectionRunner";
import {interfaces, Controller, Post} from 'inversify-express-utils';
import {ISnapshotRepository, Snapshot} from "../snapshots/ISnapshotRepository";
import IDateRetriever from "../util/IDateRetriever";

@Controller('/api/snapshots')
@injectable()
class SnapshotManagerController implements interfaces.Controller {

    constructor(@inject("IProjectionRunnerHolder") private projectionsRunnerCollection: Dictionary<IProjectionRunner<any>>,
                @inject("ISnapshotRepository") private snapshotRepository: ISnapshotRepository,
                @inject("IDateRetriever") private dateRetriever: IDateRetriever) {
    }

    @Post('/save')
    saveSnapshot(request: express.Request, response: express.Response): void {
        let projection: IProjectionRunner<any> = this.getProjectionRunner(request.body.payload.name);

        if (!projection) {
            response.status(400).json({error: "Projection not found"});
            return;
        }

        this.snapshotRepository.saveSnapshot(request.body.payload.name, new Snapshot(projection.state, this.dateRetriever.getDate()));
        this.writeResponse(response, request.body.payload.name, "Create Snapshot");
    }

    @Post('/delete')
    deleteSnapshot(request: express.Request, response: express.Response): void {
        let projection: IProjectionRunner<any> = this.getProjectionRunner(request.body.payload.name);

        if (!projection) {
            response.status(400).json({error: "Projection not found"});
            return;
        }

        this.snapshotRepository.deleteSnapshot(request.body.payload.name);
        this.writeResponse(response, request.body.payload.name, "Delete Snapshot");
    }

    private getProjectionRunner(name: string): IProjectionRunner<any> {
        return this.projectionsRunnerCollection[name];
    }

    private writeResponse(response: express.Response, name: string, operation: string) {
        response.json({name: name, operation: operation});
    }
}

export default SnapshotManagerController;