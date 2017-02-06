import RequestAdapter from "../web/RequestAdapter";
import {inject} from "inversify";
import ICluster from "./ICluster";
import {IRouteResolver, IResponse, IRequest, IRequestHandler} from "../web/IRequestComponents";
import RequestBuilder from "./RequestBuilder";

class ClusteredRequestAdapter extends RequestAdapter {

    constructor(@inject("ICluster") private cluster: ICluster,
                @inject("IRouteResolver") routeResolver: IRouteResolver) {
        super(routeResolver);
    }

    canHandle(request: IRequest, response: IResponse): boolean {
        try {
            let context = this.routeResolver.resolve(request);
            let requestHandler = context[0];
            let params = context[1];

            if (params)
                request.params = params;

            if (!requestHandler) //Since the request has no registered handlers it can still be handled via 404 error code
                return true;     //and must not be forwarded, thus the return of true

            let shardKey = requestHandler.keyFor(request),
                originalRequest = request.originalRequest,
                originalResponse = response.originalResponse;
            return !this.cluster || !shardKey || (this.cluster && this.cluster.handleOrProxy(shardKey, originalRequest, originalResponse));
        } catch (error) {
            return false;
        }
    }
}

export default ClusteredRequestAdapter
