import Channel from "../../../scripts/cluster/ChannelDecorator";
import {IRequestHandler, IRequest, IResponse} from "../../../scripts/web/IRequestComponents";
import Route from "../../../scripts/web/RouteDecorator";

@Channel("test")
export class ChannelRequestHandler implements IRequestHandler {

    handle(request: IRequest, response: IResponse) {

    }

    keyFor(request: IRequest): string {
        return "testkey";
    }
}

@Route("GET", "/noforward")
export class NoForwardRequestHandler implements IRequestHandler {

    handle(request: IRequest, response: IResponse) {

    }

    keyFor(request: IRequest): string {
        return null;
    }
}