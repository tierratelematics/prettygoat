import {IRouteResolver, IRequestHandler} from "./IRequestComponents";
import {multiInject} from "inversify";
import * as _ from "lodash";
import Methods from "./Methods";
import * as UrlPattern from "url-pattern";
import * as url from "url";

class RouteResolver implements IRouteResolver {

    private routes: Route[];

    constructor(@multiInject("IRequestHandler") requestHandlers: IRequestHandler[]) {
        this.routes = this.mapRoutes(requestHandlers);
    }

    private mapRoutes(requestHandlers: IRequestHandler[]): Route[] {
        return _.map<IRequestHandler, Route>(requestHandlers, requestHandler => {
            return {
                matcher: new UrlPattern(Reflect.getMetadata("prettygoat:path", requestHandler.constructor)),
                method: Reflect.getMetadata("prettygoat:method", requestHandler.constructor),
                handler: requestHandler
            };
        });
    }

    resolve(path: string, method: string): IRequestHandler {
        let pathname = url.parse(path).pathname;
        let route = _.find<Route>(this.routes, route => route.matcher.match(pathname) && route.method === method);
        return route ? route.handler : null;
    }

}

interface Route {
    handler: IRequestHandler;
    method: Methods;
    matcher: UrlPattern;
}

export default RouteResolver