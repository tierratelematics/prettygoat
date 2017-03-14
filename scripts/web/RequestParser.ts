import {IncomingMessage} from "http";
import {ServerResponse} from "http";
import Dictionary from "../util/Dictionary";
import * as url from "url";
import * as qs from "qs";
import {injectable} from "inversify";
import * as _ from "lodash";
import {RequestData, IRequestParser, IRequest, IResponse} from "./IRequestComponents";

@injectable()
class RequestParser implements IRequestParser {

    parse(request: IncomingMessage, response: ServerResponse): RequestData {
        return [new Request(request), new Response(response)];
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
        this.url = !isChannel ? originalRequest.url.replace(/\/+$/, "") : null; //Remove trailing slash
        this.channel = isChannel ? originalRequest.url.substr(8) : null; //Remove pgoat://
        this.method = originalRequest.method;
        this.headers = originalRequest.headers;
        this.query = qs.parse(url.parse(originalRequest.url).query);
        this.params = null;
    }
}

class Response implements IResponse {

    constructor(public originalResponse: ServerResponse) {

    }

    header(key: string, value: string) {
        this.setHeader(key, value);
    }

    setHeader(key: string, value: string) {
        this.originalResponse.setHeader(key, value);
    }

    status(code: number) {
        this.originalResponse.statusCode = code;
    }

    send(data?: any) {
        if (data) {
            this.setHeader("Content-Type", "application/json");
            this.originalResponse.write(JSON.stringify(data));
        }
        this.end();
    }

    end() {
        this.originalResponse.end();
    }

}

export default RequestParser