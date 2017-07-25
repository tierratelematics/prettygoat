import {IRequestHandler, IRequest, IResponse} from "../../../scripts/web/IRequestComponents";
import Route from "../../../scripts/web/RouteDecorator";

@Route("/test", "GET")
export class MockRequestHandler implements IRequestHandler {

    handle(request: IRequest, response: IResponse) {
    }

    keyFor(request: IRequest): string {
        return null;
    }

}

@Route("/test", "GET")
export class DuplicatedRequestHandler implements IRequestHandler {

    duplicated = true;

    handle(request: IRequest, response: IResponse) {
    }

    keyFor(request: IRequest): string {
        return null;
    }

}

@Route("/foo/:id", "GET")
export class ParamRequestHandler implements IRequestHandler {

    handle(request: IRequest, response: IResponse) {
    }

    keyFor(request: IRequest): string {
        return null;
    }

}

@Route("pgoat://readmodel/retrieve")
export class ChannelRequestHandler implements IRequestHandler {

    handle(request: IRequest, response: IResponse) {
    }

    keyFor(request: IRequest): string {
        return null;
    }

}
