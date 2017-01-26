import {IRequestAdapter, IRouteResolver, IRequest, IResponse, IMiddleware} from "./IRequestComponents";
import {inject, injectable, optional, multiInject} from "inversify";
import ICluster from "../cluster/ICluster";
import {eachSeries} from "async";

@injectable()
class RequestAdapter implements IRequestAdapter {

    constructor(@inject("ICluster") @optional() private cluster: ICluster,
                @inject("IRouteResolver") private routeResolver: IRouteResolver,
                @multiInject("IMiddleware") @optional() private middlewares: IMiddleware[]) {
    }

    route(request: IRequest, response: IResponse) {
        eachSeries(this.middlewares, (middleware, next) => {
            middleware.transform(request, response, next);
        }, () => {
            let context = this.routeResolver.resolve(
                request.url ? request.url : request.channel,
                request.url ? request.method : null
            );
            let requestHandler = context[0];
            let params = context[1];

            if (params)
                request.params = params;
            if (requestHandler) {
                let shardKey = requestHandler.keyFor(request),
                    originalRequest = request.originalRequest,
                    originalResponse = response.originalResponse;
                if (!this.cluster || !shardKey || (this.cluster && this.cluster.handleOrProxy(shardKey, originalRequest, originalResponse))) {
                    requestHandler.handle(request, response);
                }
            } else {
                response.status(404);
                response.send();
            }
        });

    }

}

export default RequestAdapter