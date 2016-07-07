import IStatePublisher from "./IStatePublisher";
import {Request} from "express";
import IProjectionRouter from "./IProjectionRouter";
import {inject, injectable} from "inversify";
import {Response} from "express";
import IProjectionRunner from "../projections/IProjectionRunner";
import PushContext from "../push/PushContext";
import {SplitProjectionRunner} from "../projections/SplitProjectionRunner";
import ContextOperations from "../push/ContextOperations";

@injectable()
class ExpressStatePublisher implements IStatePublisher {

    constructor(@inject("IProjectionRouter") private router:IProjectionRouter) {

    }

    publish<T>(projectionRunner:IProjectionRunner<T>, context:PushContext):void {
        if (projectionRunner instanceof SplitProjectionRunner) {
            this.router.get(ContextOperations.getEndpoint(context, true), (request:Request, response:Response) => {
                let runner = projectionRunner.state[request.params['key']];
                if (runner)
                    response.json(runner.state);
                else
                    response.status(404).json({error: "Projection not found"});
            });
        } else {
            this.router.get(ContextOperations.getEndpoint(context), (request:Request, response:Response) => {
                response.json(projectionRunner.state);
            });
        }
    }

}

export default ExpressStatePublisher