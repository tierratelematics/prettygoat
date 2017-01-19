import {IncomingMessage} from "http";
import {ServerResponse} from "http";
import Methods from "./Methods";

export interface IRequestAdapter {
    route(request: IRequest, response: IResponse);
}

export interface IRequestHandler {
    handle(request: IncomingMessage, response: ServerResponse);
    keyFor(request: IncomingMessage): string;
}

export interface IRouteResolver {
    resolve(path: string): IRequestHandler;
}

export interface IRequestParser {
    parse(request: IncomingMessage, response: ServerResponse): Promise<[IRequest, IResponse]>;
}

export interface IRequest {
    path: string;
    headers: string[];
    method: Methods;
    body: any;
}

export interface IResponse {

}