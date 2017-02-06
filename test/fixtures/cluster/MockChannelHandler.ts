import Channel from "../../../scripts/cluster/ChannelDecorator";
import {IRequestHandler, IRequest, IResponse} from "../../../scripts/web/IRequestComponents";

@Channel("test")
export default class ChannelRequestHandler implements IRequestHandler {

    handle(request: IRequest, response: IResponse) {
        request.params.channel = true;
    }

    keyFor(request: IRequest): string {
        return "testkey";
    }
}