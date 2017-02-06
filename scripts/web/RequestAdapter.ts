import {IRequestAdapter, IRouteResolver, IRequest, IResponse, IRequestHandler} from "./IRequestComponents";
import {inject, injectable} from "inversify";
import {assign} from "lodash";

@injectable()
class RequestAdapter implements IRequestAdapter {

    constructor(@inject("IRouteResolver") protected routeResolver: IRouteResolver) {
    }

    route(request: IRequest, response: IResponse) {
        let context = this.routeResolver.resolve(request);
        let requestHandler = context[0];
        let params = context[1];

        if (params)
            assign(request.params, params);
        if (requestHandler) {
            if (this.canHandle(request, response)) {
                requestHandler.handle(request, response);
            }
        } else {
            response.status(404);
            response.send();
        }
    }

    canHandle(request: IRequest, response: IResponse): boolean {
        return true;
    }

}

export default RequestAdapter