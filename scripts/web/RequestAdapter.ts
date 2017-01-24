import {IRequestAdapter, IRouteResolver, IRequest, IResponse} from "./IRequestComponents";
import {inject, injectable, optional} from "inversify";
import ICluster from "../cluster/ICluster";

@injectable()
class RequestAdapter implements IRequestAdapter {

    constructor(@inject("ICluster") @optional() private cluster: ICluster,
                @inject("IRouteResolver") private routeResolver: IRouteResolver) {
    }

    route(request: IRequest, response: IResponse) {
        let context = this.routeResolver.resolve(request.url, request.method);
        let requestHandler = context[0];
        let params = context[1];

        if (params)
            request.params = params;
        if (requestHandler) {
            let shardKey = requestHandler.keyFor(request),
                originalRequest = request.originalRequest,
                originalResponse = response.originalResponse;
            if (!this.cluster || (this.cluster && this.cluster.handleOrProxy(shardKey, originalRequest, originalResponse))) {
                requestHandler.handle(request, response);
            }
        } else {
            response.status(404);
            response.send();
        }
    }

}

export default RequestAdapter