import * as express from 'express';
import {injectable, inject} from 'inversify';
import Dictionary from "../Dictionary";
import IProjectionRunner from "../projections/IProjectionRunner";
import {Controller, Get, Post} from 'inversify-express-utils';
import {ISnapshotRepository, Snapshot} from "../snapshots/ISnapshotRepository";

@Controller('/api/snapshots')
@injectable()
class SnapshotManagerController implements Controller {

    constructor(@inject("IProjectionRunnerHolder") private projectionsRunnerCollection: Dictionary<IProjectionRunner<any>>,
                @inject("ISnapshotRepository") private snapshotRepository: ISnapshotRepository) {
    }

    @Post('/save')
    saveSnapshot(request: express.Request, response: express.Response): void {
        let projection: IProjectionRunner<any> = this.getProjectionRunner(request.body.name);

        if (!projection) {
            response.status(400).json({error: "Projection not found"});
            return;
        }

        this.snapshotRepository.saveSnapshot(request.body.name, new Snapshot(projection.state, new Date()));
        this.writeResponse(response, request.body.name, "Create Snapshot");
    }

    @Post('/delete')
    deleteSnapshot(request: express.Request, response: express.Response): void {
        let projection: IProjectionRunner<any> = this.getProjectionRunner(request.body.name);

        if (!projection) {
            response.status(400).json({error: "Projection not found"});
            return;
        }

        this.snapshotRepository.deleteSnapshot(request.body.name);
        this.writeResponse(response, request.body.name, "Delete Snapshot");
    }

    private getProjectionRunner(name: string): IProjectionRunner<any> {
        return this.projectionsRunnerCollection[name];
    }

    private writeResponse(response: express.Response, name: string, operation: string) {
        response.json({name: name, operation: operation});
    }
}

export default SnapshotManagerController;