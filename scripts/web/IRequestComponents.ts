import {IncomingMessage} from "http";
import {ServerResponse} from "http";
import {Request, Response} from "express";

export interface IRequestAdapter {
    route(request: Request, response: Response);
}

export interface IRequestHandler {
    handle(request: Request, response: Response);
    keyFor(request: Request): string;
}

export interface IRouteResolver {
    resolve(path: string): IRequestHandler;
}

export interface IRequestParser {
    parse(request: IncomingMessage, response: ServerResponse): Promise<[Request, Response]>;
}
