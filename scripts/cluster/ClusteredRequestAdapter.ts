import RequestAdapter from "../web/RequestAdapter";
import {inject} from "inversify";
import ICluster from "./ICluster";
import {IRouteResolver, IResponse, IRequest, IRequestHandler} from "../web/IRequestComponents";

class ClusteredRequestAdapter extends RequestAdapter {

    constructor(@inject("ICluster") private cluster: ICluster,
                @inject("IRouteResolver") routeResolver: IRouteResolver) {
        super(routeResolver);
    }

    protected canHandleRequest(requestHandler: IRequestHandler, request: IRequest, response: IResponse): boolean {
        let shardKey = requestHandler.keyFor(request),
            originalRequest = request.originalRequest,
            originalResponse = response.originalResponse;
        return !this.cluster || !shardKey || (this.cluster && this.cluster.handleOrProxy(shardKey, originalRequest, originalResponse));
    }
}

export default ClusteredRequestAdapter
