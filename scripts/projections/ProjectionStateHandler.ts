import {IRequestHandler, IRequest, IResponse} from "../web/IRequestComponents";
import Route from "../web/RouteDecorator";
import {inject} from "inversify";
import Dictionary from "../common/Dictionary";
import {IProjectionRunner} from "./IProjectionRunner";
import {STATUS_CODES} from "http";
import {IProjectionRegistry} from "../bootstrap/ProjectionRegistry";
import {DeliverAuthorization, DeliverResult, IdentityDeliverStrategy} from "./Deliver";
import {IReadModelRetriever} from "../readmodels/ReadModelRetriever";
import {map, zipObject, cloneDeep} from "lodash";
import {IProjection, PublishPoint} from "./IProjection";
import {ILogger, NullLogger, LoggingContext} from "inversify-logging";

@Route("/projections/:area/:publishPoint", "GET")
@LoggingContext("ProjectionStateHandler")
class ProjectionStateHandler implements IRequestHandler {

    @inject("ILogger") private logger: ILogger = NullLogger;

    constructor(@inject("IProjectionRegistry") private projectionRegistry: IProjectionRegistry,
                @inject("IProjectionRunnerHolder") private holder: Dictionary<IProjectionRunner>,
                @inject("IReadModelRetriever") private readModelRetriever: IReadModelRetriever) {
    }

    async handle(request: IRequest, response: IResponse) {
        let pointName = request.params.publishPoint,
            area = request.params.area,
            lookup = this.projectionRegistry.projectionFor(pointName, area),
            projection = lookup ? lookup[1] : null;
        if (!projection || !(<any>projection).publish) {
            this.logger.warning(`An invalid projection (or a readmodel) has been requested, returning a not found`);
            this.sendNotFound(response);
        } else {
            let publishPoint = this.getPublishpoint(projection, pointName),
                deliverStrategy = publishPoint.deliver || new IdentityDeliverStrategy<any>(),
                projectionRunner = this.holder[projection.name],
                dependencies = publishPoint.readmodels ? publishPoint.readmodels.$list : [];

            try {
                let deliverContext = {
                    headers: request.headers,
                    params: request.query,
                };
                this.logger.debug(`Delivering ${projection.name} state with context ${JSON.stringify(deliverContext)}`);
                let readModels = await Promise.all(map(dependencies, name => this.readModelRetriever.modelFor(name)));

                if (!projectionRunner) {
                    this.logger.warning(`${projection.name} is not running, maybe it's on another node?`);
                    response.status(500);
                    response.send({error: STATUS_CODES[500]});
                } else {
                    let deliverResult = await deliverStrategy.deliver(cloneDeep(projectionRunner.state), deliverContext, zipObject(dependencies, readModels));
                    this.sendResponse(response, deliverResult);
                }
            } catch (error) {
                this.logger.error(`${projection.name} delivery failed`);
                this.logger.error(error);
                response.status(500);
                response.send({error: STATUS_CODES[500]});
            }
        }
    }

    private getPublishpoint(projection: IProjection, point: string): PublishPoint<any> {
        let match = new RegExp(point, "i").exec(Object.getOwnPropertyNames(projection.publish).toString());
        return projection.publish[match[0]];
    }

    private sendNotFound(response: IResponse) {
        response.status(404);
        response.send({error: "Projection not found"});
    }

    private sendResponse<T>(response: IResponse, deliverResult: DeliverResult<T>) {
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
