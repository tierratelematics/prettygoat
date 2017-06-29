import {IRequestHandler, IRequest, IResponse} from "../web/IRequestComponents";
import Route from "../web/RouteDecorator";
import {inject} from "inversify";
import Dictionary from "../util/Dictionary";
import {IProjectionRunner} from "./IProjectionRunner";
import {STATUS_CODES} from "http";
import {IProjectionRegistry} from "../bootstrap/ProjectionRegistry";
import {IProjection} from "./IProjection";
import {DeliverAuthorization, IDeliverStrategy, IdentityDeliverStrategy} from "./Deliver";

@Route("GET", "/projections/:area/:publishPoint(/:partitionKey)")
class ProjectionStateHandler implements IRequestHandler {

    constructor(@inject("IProjectionRegistry") private projectionRegistry: IProjectionRegistry,
                @inject("IProjectionRunnerHolder") private holder: Dictionary<IProjectionRunner>) {
    }

    handle(request: IRequest, response: IResponse): Promise<void> {
        let publishPoint = request.params.publishPoint,
            area = request.params.area,
            projection = this.projectionRegistry.projectionFor(publishPoint, area)[1];
        if (!projection || !(<any>projection).publish) {
            this.sendNotFound(response);
        } else {
            let deliverStrategy = (<IProjection>projection).publish[publishPoint].deliver || new IdentityDeliverStrategy<any>(),
                projectionRunner = this.holder[projection.name];
            return this.sendResponse(request, response, projectionRunner.state, deliverStrategy);
        }
    }

    private sendNotFound(response: IResponse) {
        response.status(404);
        response.send({error: "Projection not found"});
    }

    private async sendResponse<T>(request: IRequest, response: IResponse, state: T,
                                  deliverStrategy: IDeliverStrategy<T>) {
        let deliverContext = {
            headers: request.headers,
            params: request.query,
            partitionKey: request.params.partitionKey
        };
        let deliverResult = await deliverStrategy.deliver(state, deliverContext);
        switch (deliverResult[1]) {
            case DeliverAuthorization.CONTENT:
                response.status(200);
                response.send(deliverResult[0]);
                break;
            case DeliverAuthorization.UNAUTHORIZED:
                response.status(401);
                response.send({error: STATUS_CODES[401]});
                break;
            case DeliverAuthorization.FORBIDDEN:
                response.status(403);
                response.send({error: STATUS_CODES[403]});
                break;
            default:
                response.send({});
        }
    }

    keyFor(request: IRequest): string {
        let publishPoint = request.params.publishPoint,
            area = request.params.area;
        let projection = this.projectionRegistry.projectionFor(publishPoint, area)[1];
        return !projection ? null : projection.name;
    }

}

export default ProjectionStateHandler
