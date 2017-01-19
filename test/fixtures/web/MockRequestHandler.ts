import {IRequestHandler} from "../../../scripts/web/IRequestComponents";
import {IncomingMessage} from "http";
import {ServerResponse} from "http";
import Request from "../../../scripts/web/RequestDecorator";
import Methods from "../../../scripts/web/Methods";

@Request(Methods.Get, "/test")
export default class MockRequestHandler implements IRequestHandler {

    handle(request: IncomingMessage, response: ServerResponse) {

    }

    keyFor(request: IncomingMessage): string {
        return undefined;
    }

}