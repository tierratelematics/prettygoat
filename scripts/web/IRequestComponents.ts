import {IncomingMessage} from "http";
import {ServerResponse} from "http";
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

export interface IRequest {
    url: string;
    channel: string;
    method: string;
    headers: Dictionary<string>;
    query: Dictionary<string>;
    params: any;
    body: any;
    originalRequest: IncomingMessage;
}

export interface IResponse {
    statusCode: number;
    header(key: string, value: string);
    setHeader(key: string, value: string);
    status(code: number);
    send(data?: any);
    end();
    originalResponse: ServerResponse;
}

export type RequestData = [IRequest, IResponse];

export interface IMiddleware {
    transform(request: IRequest, response: IResponse, next: Function);
}

export interface IRequestParser {
    parse(request: IncomingMessage, response: ServerResponse): Promise<RequestData>;
}