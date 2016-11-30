import IStatePublisher from "./IStatePublisher";
import {Request} from "express";
import IProjectionRouter from "./IProjectionRouter";
import {inject, injectable} from "inversify";
import {Response} from "express";
import IProjectionRunner from "../projections/IProjectionRunner";
import PushContext from "../push/PushContext";
import ContextOperations from "../push/ContextOperations";
import SplitProjectionRunner from "../projections/SplitProjectionRunner";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import RegistryEntry from "../registry/RegistryEntry";
import FilterOutputType from "../filters/FilterOutputType";
import IFilterStrategy from "../filters/IFilterStrategy";
import app from "../bootstrap/InversifyExpressApp";

@injectable()
class ExpressStatePublisher implements IStatePublisher {

    private router:any = null;

    constructor(
        @inject("IProjectionRegistry") private projectionRegistry: IProjectionRegistry) {
    }

    publish<T>(projectionRunner: IProjectionRunner<T>, context: PushContext): void {
        this.initRouter();
        let filterStrategy = this.projectionRegistry.getEntry(context.viewmodelId, context.area).data.projection.filterStrategy;
        if (projectionRunner instanceof SplitProjectionRunner) {
            this.router.get(ContextOperations.getEndpoint(context, true), (request: Request, response: Response) => {
                let state = projectionRunner.state[request.params['key']];
                if (state)
                    this.writeResponse(request, response, state, filterStrategy);
                else
                    response.status(404).json({ error: "Projection not found" });
            });
        } else {
            this.router.get(ContextOperations.getEndpoint(context), (request: Request, response: Response) => {
                this.writeResponse(request, response, projectionRunner.state, filterStrategy);
            });
        }
    }

    private initRouter(){
        if(!this.router)
            this.router = app();
    }

    private writeResponse<T>(request: Request, response: Response, state: T, filterStrategy: IFilterStrategy<T>): void {
        if (!filterStrategy) {
            response.json(state);
        } else {
            let filterContext = { headers: request.headers, params: request.query };
            let filteredProjection = filterStrategy.filter(state, filterContext);
            switch (filteredProjection.type) {
                case FilterOutputType.CONTENT:
                    response.status(200).json(filteredProjection.filteredState);
                    break;
                case FilterOutputType.UNAUTHORIZED:
                    response.status(401).json({ error: "Unauthorized" });
                    break;
                case FilterOutputType.FORBIDDEN:
                    response.status(403).json({ error: "Forbidden" });
                    break;
                default:
                    response.json({});
            }
        }
    }
}

export default ExpressStatePublisher