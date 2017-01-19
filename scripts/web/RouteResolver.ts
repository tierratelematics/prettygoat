import {IRouteResolver, IRequestHandler} from "./IRequestComponents";

class RouteResolver implements IRouteResolver {

    resolve(path: string): IRequestHandler {
        return undefined;
    }

}

export default RouteResolver