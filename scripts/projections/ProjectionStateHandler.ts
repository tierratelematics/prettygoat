import {IRequestHandler} from "../web/IRequestComponents";
import {Request, Response} from "express";
import Route from "../web/RouteDecorator";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import FilterOutputType from "../filters/FilterOutputType";
import IFilterStrategy from "../filters/IFilterStrategy";
import {inject} from "inversify";
import Dictionary from "../util/Dictionary";
import IProjectionRunner from "./IProjectionRunner";
import IdentityFilterStrategy from "../filters/IdentityFilterStrategy";

@Route("GET", "/:area/:projectionName(/:splitKey)")
class ProjectionStateHandler implements IRequestHandler {

    constructor(@inject("IProjectionRegistry") private projectionRegistry: IProjectionRegistry,
                @inject("IProjectionRunnerHolder") private holder: Dictionary<IProjectionRunner<any>>) {
    }

    handle(request: Request, response: Response) {
        let projectionName = request.params.projectionName,
            area = request.params.area,
            splitKey = request.params.key,
            entry = this.projectionRegistry.getEntry(projectionName, area).data;
        if (!entry) {
            this.sendNotFound(response);
        } else {
            let filterStrategy = entry.projection.filterStrategy,
                projectionRunner = this.holder[entry.projection.name],
                state = projectionRunner.state;
            if (splitKey) {
                state = state[splitKey];
            }
            if (state)
                this.sendResponse(request, response, state, filterStrategy);
            else
                this.sendNotFound(response);
        }
    }

    private sendNotFound(response: Response) {
        response.status(404).json({error: "Projection not found"});
    }

    private sendResponse<T>(request: Request, response: Response, state: T,
                            filterStrategy: IFilterStrategy<T> = new IdentityFilterStrategy<T>()): void {
        let filterContext = {headers: request.headers, params: request.query};
        let filteredProjection = filterStrategy.filter(state, filterContext);
        switch (filteredProjection.type) {
            case FilterOutputType.CONTENT:
                response.status(200).json(filteredProjection.filteredState);
                break;
            case FilterOutputType.UNAUTHORIZED:
                response.status(401).json({error: "Unauthorized"});
                break;
            case FilterOutputType.FORBIDDEN:
                response.status(403).json({error: "Forbidden"});
                break;
            default:
                response.json({});
        }
    }

    keyFor(request: Request): string {
        return undefined;
    }

}

export default ProjectionStateHandler