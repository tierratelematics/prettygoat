import {IRequestHandler, IRequest, IResponse} from "../../../scripts/web/IRequestComponents";
import Route from "../../../scripts/web/RouteDecorator";

@Route("GET", "/test")
export class MockRequestHandler implements IRequestHandler {

    handle(request: IRequest, response: IResponse) {
        //Access request in order to test handler call
        request.params.accessed = true;
    }

    keyFor(request: IRequest): string {
        return null;
    }

}

@Route("GET", "/foo/:id")
export class ParamRequestHandler implements IRequestHandler {

    handle(request: IRequest, response: IResponse) {
        //Access request in order to test handler call
        request.params.accessed = true;
    }

    keyFor(request: IRequest): string {
        return null;
    }

}