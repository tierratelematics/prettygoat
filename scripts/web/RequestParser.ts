import {IncomingMessage} from "http";
import {ServerResponse} from "http";
import Dictionary from "../util/Dictionary";
import * as url from "url";
import * as qs from "qs";
import {injectable, optional, multiInject} from "inversify";
import * as _ from "lodash";
import {eachSeries} from "async";
import {RequestData, IMiddleware, IRequestParser, IRequest, IResponse} from "./IRequestComponents";

@injectable()
class RequestParser implements IRequestParser {

    constructor(@multiInject("IMiddleware") @optional() private middlewares: IMiddleware[]) {

    }

    parse(request: IncomingMessage, response: ServerResponse): Promise<RequestData> {
        let requestParsed = new Request(request);
        let responseParsed = new Response(response);

        return new Promise((resolve, reject) => {
            eachSeries(this.middlewares, (middleware, next) => {
                middleware.transform(requestParsed, responseParsed, next);
            }, (error) => {
                if (error) reject(error);
                else resolve([requestParsed, responseParsed]);
            });
        });
    }
}

class Request implements IRequest {
    url: string;
    channel: string;
    method: string;
    headers: Dictionary<string>;
    query: Dictionary<string>;
    params: any;
    body: any;

    constructor(public originalRequest: IncomingMessage) {
        let isChannel = _.startsWith(originalRequest.url, "pgoat://");
        this.url = !isChannel ? originalRequest.url : null;
        this.channel = isChannel ? originalRequest.url.substr(8) : null; //Remove pgoat://
        this.method = originalRequest.method;
        this.headers = originalRequest.headers;
        this.query = qs.parse(url.parse(originalRequest.url).query);
        this.params = null;
        this.body = (<any>originalRequest).body;
    }
}

class Response implements IResponse {
    private headers: Dictionary < string > = {};
    private statusCode = 200;

    constructor(public originalResponse: ServerResponse) {

    }

    header(key: string, value: string) {
        this.headers[key] = value;
    }

    setHeader(key: string, value: string) {
        this.header(key, value);
    }

    status(code: number) {
        this.statusCode = code;
    }

    send(data?: any) {
        this.originalResponse.writeHead(this.statusCode, _.assign(this.headers, {
            "content-type": "application/json; charset=utf-8"
        }));
        if (data) this.originalResponse.write(JSON.stringify(data));
        this.end();
    }

    end() {
        this.originalResponse.end();
    }

}

export default RequestParser