import {IncomingMessage} from "http";
import {ServerResponse} from "http";

export interface IRequestRegistry {
    add(handler: IRequestHandler);
}

export interface IRequestAdapter extends IRequestRegistry {
    route(request: IncomingMessage, response: ServerResponse);
}

export interface IRequestHandler {
    handle(request: IncomingMessage, response: ServerResponse);
    keyFor(request: IncomingMessage): string;
}