import {IRouteResolver, IRequestHandler, IRouteContext, IRequest} from "./IRequestComponents";
import {multiInject, injectable, optional} from "inversify";
import * as _ from "lodash";
import Methods from "./Methods";
import * as UrlPattern from "url-pattern";
import * as url from "url";

@injectable()
class RouteResolver implements IRouteResolver {

    private routes: Route[];

    constructor(@multiInject("IRequestHandler") @optional() requestHandlers: IRequestHandler[] = []) {
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

    resolve(request: IRequest): IRouteContext {
        let pathname = url.parse(request.url).pathname;
        return <IRouteContext>_(this.routes)
            .filter(route => route.method === request.method)
            .map(route => [route.handler, route.matcher.match(pathname)])
            .filter(route => route[1])
            .flatten()
            .valueOf();
    }

}

interface Route {
    handler: IRequestHandler;
    method: Methods;
    matcher: UrlPattern;
}

export default RouteResolver