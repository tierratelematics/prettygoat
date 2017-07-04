import {IRequestHandler, IRequest, IResponse} from "../../../scripts/web/IRequestComponents";
import Route from "../../../scripts/web/RouteDecorator";

@Route("GET", "/test")
export class MockRequestHandler implements IRequestHandler {

    handle(request: IRequest, response: IResponse) {
    }

    keyFor(request: IRequest): string {
        return null;
    }

}

@Route("GET", "/test")
export class DuplicatedRequestHandler implements IRequestHandler {

    duplicated = true;

    handle(request: IRequest, response: IResponse) {
    }

    keyFor(request: IRequest): string {
        return null;
    }

}

@Route("GET", "/foo/:id")
export class ParamRequestHandler implements IRequestHandler {

    handle(request: IRequest, response: IResponse) {
    }

    keyFor(request: IRequest): string {
        return null;
    }

}

@Route("GET", undefined)
export class NoUrlRequestHandler implements IRequestHandler {

    handle(request: IRequest, response: IResponse) {
    }

    keyFor(request: IRequest): string {
        return null;
    }

}

