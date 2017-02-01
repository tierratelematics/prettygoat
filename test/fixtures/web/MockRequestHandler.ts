import {IRequestHandler, IRequest, IResponse} from "../../../scripts/web/IRequestComponents";
import Route from "../../../scripts/web/RouteDecorator";
import Channel from "../../../scripts/cluster/ChannelDecorator";

@Route("GET", "/test")
export class MockRequestHandler implements IRequestHandler {

    handle(request: IRequest, response: IResponse) {
        //Access request in order to test handler call
        request.params.accessed = true;
    }

    keyFor(request: IRequest): string {
        return "testkey";
    }

}

@Route("GET", "/noforward")
export class NoForwardRequestHandler implements IRequestHandler {

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
        return "testkey";
    }

}

@Channel("test")
export class ChannelRequestHandler implements IRequestHandler {

    handle(request: IRequest, response: IResponse) {
        request.params.channel = true;
    }

    keyFor(request: IRequest): string {
        return "testkey";
    }


}