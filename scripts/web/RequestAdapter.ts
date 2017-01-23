import {IRequestAdapter, IRouteResolver} from "./IRequestComponents";
import {Request, Response} from "express";
import {inject, injectable, optional} from "inversify";
import ICluster from "../cluster/ICluster";

@injectable()
class RequestAdapter implements IRequestAdapter {

    constructor(@inject("ICluster") @optional() private cluster: ICluster,
                @inject("IRouteResolver") private routeResolver: IRouteResolver) {
    }

    route(request: Request, response: Response) {
        let context = this.routeResolver.resolve(request.url, request.method);
        let requestHandler = context[0];
        let params = context[1];

        if (params)
            request.params = params;
        if (requestHandler) {
            if (!this.cluster || (this.cluster && this.cluster.handleOrProxy(requestHandler.keyFor(request), request, response))) {
                requestHandler.handle(request, response);
            }
        } else {
            response.status(404).end();
        }
    }

}

export default RequestAdapter