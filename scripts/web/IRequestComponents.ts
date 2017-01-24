import {IncomingMessage} from "http";
import {ServerResponse} from "http";
import {Request, Response} from "express";
import Methods from "./Methods";
import Dictionary from "../util/Dictionary";

export interface IRequestAdapter {
    route(request: IRequest, response: IResponse);
}

export interface IRequestHandler {
    handle(request: IRequest, response: IResponse);
    keyFor(request: IRequest): string;
}

export interface IRouteResolver {
    resolve(path: string, method: string): IRouteContext;
}

export type IRouteContext = [IRequestHandler, any];

export interface IRequestParser {
    parse(request: IncomingMessage, response: ServerResponse): Promise<[Request, Response]>;
}

export interface IRequest {
    url: string,
    method: string,
    headers: Dictionary<string>;
    query: Dictionary<string>;
    params: any;
    body: any;
    originalRequest: IncomingMessage;
}

export interface IResponse {
    header(key: string, value: string);
    status(code: number);
    send(data?: any);
    originalResponse: ServerResponse;
}

export interface IMessageParser<T, U> {
    parse(request: T, response: U): [IRequest, IResponse];
}