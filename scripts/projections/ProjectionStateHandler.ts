import {IRequestHandler, IRequest, IResponse} from "../web/IRequestComponents";
import Route from "../web/RouteDecorator";
import {inject} from "inversify";
import Dictionary from "../common/Dictionary";
import {IProjectionRunner} from "./IProjectionRunner";
import {STATUS_CODES} from "http";
import {IProjectionRegistry} from "../bootstrap/ProjectionRegistry";
import {DeliverAuthorization, DeliverResult, IdentityDeliverStrategy} from "./Deliver";
import {IReadModelRetriever} from "../readmodels/ReadModelRetriever";
import {map, zipObject} from "lodash";
import {IProjection, PublishPoint} from "./IProjection";
import {ILogger, NullLogger, LoggingContext, createChildLogger} from "inversify-logging";

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

            let childLogger = createChildLogger(createChildLogger(this.logger, projection.name), pointName);
            try {
                let deliverContext = {
                    headers: request.headers,
                    params: request.query,
                };
                childLogger.debug(`Delivering projection state with context ${JSON.stringify(deliverContext)}`);
                let readModels = await Promise.all(map(dependencies, name => this.readModelRetriever.modelFor(name)));

                let deliverResult = await deliverStrategy.deliver(projectionRunner.state, deliverContext, zipObject(dependencies, readModels));
                this.sendResponse(response, deliverResult, childLogger);
            } catch (error) {
                childLogger.error(`Projection delivery failed`);
                childLogger.error(error);
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

    private sendResponse<T>(response: IResponse, deliverResult: DeliverResult<T>, logger: ILogger) {
        switch (deliverResult[1]) {
            case DeliverAuthorization.CONTENT:
                logger.debug(`Projection state delivered with 200`);
                response.status(200);
                response.send(deliverResult[0]);
                break;
            case DeliverAuthorization.UNAUTHORIZED:
                logger.debug(`Projection state delivered with 401`);
                response.status(401);
                response.send({error: STATUS_CODES[401]});
                break;
            case DeliverAuthorization.FORBIDDEN:
                logger.debug(`Projection state delivered with 403`);
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
