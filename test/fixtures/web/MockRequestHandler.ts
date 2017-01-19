import {IRequestHandler} from "../../../scripts/web/IRequestComponents";
import {IncomingMessage} from "http";
import {ServerResponse} from "http";
import Request from "../../../scripts/web/RequestDecorator";
import Methods from "../../../scripts/web/Methods";

@Request(null, "/test")
export class NoMethodRequestHandler implements IRequestHandler {

    keyFor(request: IncomingMessage): string {
        return undefined;
    }

    handle() {
    }

}

@Request(Methods.Get, null)
export class NoPathRequestHandler implements IRequestHandler {

    handle(request: IncomingMessage, response: ServerResponse) {

    }

    keyFor(request: IncomingMessage): string {
        return undefined;
    }

}
