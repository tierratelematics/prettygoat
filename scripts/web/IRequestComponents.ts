import {IncomingMessage} from "http";
import {ServerResponse} from "http";
import Dictionary from "../common/Dictionary";
import {ValueOrPromise} from "../common/TypesUtil";

export interface IRequestAdapter {
    route(request: IRequest, response: IResponse);
    canHandle(request: IRequest, response: IResponse): boolean;
}

export interface IRequestHandler {
    handle(request: IRequest, response: IResponse): ValueOrPromise<void>;
    keyFor(request: IRequest): string;
}

export interface IRouteResolver {
    resolve(request: IRequest): IRouteContext;
}

export type IRouteContext = [IRequestHandler, any];

export interface IRequest<T = any> {
    url: string;
    method: string;
    headers: Dictionary<string>;
    query: Dictionary<string>;
    params: any;
    body: T;
    originalRequest: IncomingMessage;
}

export interface IResponse {
    originalResponse: ServerResponse;
    header(key: string, value: string);
    setHeader(key: string, value: string);
    status(code: number);
    send(data?: any);
    end();
}

export type RequestData = [IRequest, IResponse];

export interface IMiddleware {
    transform(request: IRequest, response: IResponse, next: Function);
}

export interface IRequestParser {
    parse(request: IncomingMessage, response: ServerResponse): RequestData;
}

export interface IMiddlewareTransformer {
    transform(request: IRequest, response: IResponse): Promise<RequestData>;
}

export interface IDateRetriever {
    getDate(): Date;
}