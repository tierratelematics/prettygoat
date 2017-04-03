import {IRequestHandler, IRequest, IResponse} from "../web/IRequestComponents";
import Route from "../web/RouteDecorator";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import {inject} from "inversify";
import Dictionary from "../util/Dictionary";
import IProjectionRunner from "./IProjectionRunner";
import IdentityFilterStrategy from "../filters/IdentityFilterStrategy";
import {STATUS_CODES} from "http";
import {IFilterStrategy} from "../filters/IFilterStrategy";
import {FilterOutputType} from "../filters/FilterComponents";

@Route("GET", "/projections/:area/:projectionName(/:splitKey)")
class ProjectionStateHandler implements IRequestHandler {

    constructor(@inject("IProjectionRegistry") private projectionRegistry: IProjectionRegistry,
                @inject("IProjectionRunnerHolder") private holder: Dictionary<IProjectionRunner<any>>) {
    }

    handle(request: IRequest, response: IResponse): Promise<void> {
        let projectionName = request.params.projectionName,
            area = request.params.area,
            splitKey = request.params.splitKey,
            entry = this.projectionRegistry.getEntry(projectionName, area).data;
        if (!entry) {
            this.sendNotFound(response);
        } else {
            let filterStrategy = entry.projection.filterStrategy || new IdentityFilterStrategy<any>(),
                projectionRunner = this.holder[entry.projection.name],
                state;
            if (entry.projection.split) {
                state = projectionRunner.state[splitKey];
            } else {
                state = projectionRunner.state;
            }
            if (state)
                return this.sendResponse(request, response, state, filterStrategy);
            else
                this.sendNotFound(response);
        }
    }

    private sendNotFound(response: IResponse) {
        response.status(404);
        response.send({error: "Projection not found"});
    }

    private async sendResponse<T>(request: IRequest, response: IResponse, state: T,
                                  filterStrategy: IFilterStrategy<T>) {
        let filterContext = {headers: request.headers, params: request.query};
        let filteredProjection = await filterStrategy.filter(state, filterContext);
        switch (filteredProjection.type) {
            case FilterOutputType.CONTENT:
                response.status(200);
                response.send(filteredProjection.filteredState);
                break;
            case FilterOutputType.UNAUTHORIZED:
                response.status(401);
                response.send({error: STATUS_CODES[401]});
                break;
            case FilterOutputType.FORBIDDEN:
                response.status(403);
                response.send({error: STATUS_CODES[403]});
                break;
            default:
                response.send({});
        }
    }

    keyFor(request: IRequest): string {
        let projectionName = request.params.projectionName,
            area = request.params.area;
        let entry = this.projectionRegistry.getEntry(projectionName, area).data;
        return !entry ? null : entry.projection.name;
    }

}

export default ProjectionStateHandler