import {IRouteResolver, IRequest, IRouteContext} from "../../../scripts/web/IRequestComponents";

export default class MockRouteResolver implements IRouteResolver {
    resolve(request: IRequest): IRouteContext {
        return undefined;
    }

}