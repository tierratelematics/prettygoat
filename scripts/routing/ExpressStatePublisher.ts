import IStatePublisher from "./IStatePublisher";
import {Request} from "express";
import IProjectionRouter from "./IProjectionRouter";
import {inject, injectable} from "inversify";
import {Response} from "express";
import IProjectionRunner from "../projections/IProjectionRunner";
import PushContext from "../push/PushContext";
import ContextOperations from "../push/ContextOperations";
import SplitProjectionRunner from "../projections/SplitProjectionRunner";

@injectable()
class ExpressStatePublisher implements IStatePublisher {

    constructor(@inject("IProjectionRouter") private router:IProjectionRouter) {

    }

    publish<T>(projectionRunner:IProjectionRunner<T>, context:PushContext):void {
        if (projectionRunner instanceof SplitProjectionRunner) {
            this.router.get(ContextOperations.getEndpoint(context, true), (request:Request, response:Response) => {
                let state = projectionRunner.state[request.params['key']];
                if (state)
                    response.json(state);
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