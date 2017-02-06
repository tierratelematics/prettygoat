import {IRouteResolver, IRequestHandler, IRouteContext, IRequest} from "../web/IRequestComponents";
import {inject, optional, multiInject, injectable} from "inversify";
import * as _ from "lodash";

@injectable()
class ClusteredRouteResolver implements IRouteResolver {

    private routes: Route[] = [];

    constructor(@inject("RouteResolver") private resolver: IRouteResolver,
                @multiInject("IRequestHandler") @optional() requestHandlers: IRequestHandler[] = []) {
        this.routes = this.mapRoutes(requestHandlers);
    }

    private mapRoutes(requestHandlers: IRequestHandler[]): Route[] {
        return _.map<IRequestHandler, Route>(requestHandlers, requestHandler => {
            return {
                channel: Reflect.getMetadata("prettygoat:channel", requestHandler.constructor),
                handler: requestHandler
            };
        });
    }

    resolve(request: IRequest): IRouteContext {
        if (request.channel) {
            let route = _.find(this.routes, route => route.channel === request.channel);
            return [route ? route.handler : null, null];
        } else {
            return this.resolver.resolve(request);
        }
    }

}

interface Route {
    handler: IRequestHandler;
    channel: string;
}

export default ClusteredRouteResolver