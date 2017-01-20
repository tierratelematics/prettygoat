import {IRequestAdapter, IRouteResolver} from "./IRequestComponents";
import {Request, Response} from "express";
import {inject} from "inversify";
import ICluster from "../cluster/ICluster";

class RequestAdapter implements IRequestAdapter {

    constructor(@inject("ICluster") private cluster: ICluster,
                @inject("IRouteResolver") private routeResolver: IRouteResolver) {
    }

    route(request: Request, response: Response) {
        let requestHandler = this.routeResolver.resolve(request.originalUrl);
        if (requestHandler) {
            if (this.cluster.handleOrProxy(requestHandler.keyFor(request), request, response)) {
                requestHandler.handle(request, response);
            }
        } else {
            response.status(404).end();
        }
    }

}

export default RequestAdapter