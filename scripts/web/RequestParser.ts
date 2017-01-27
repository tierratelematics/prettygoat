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
        let requestParsed = this.parseRequest(request);
        let responseParsed = this.parseResponse(response);

        return new Promise((resolve, reject) => {
            eachSeries(this.middlewares, (middleware, next) => {
                middleware.transform(requestParsed, responseParsed, next);
            }, (error) => {
                if (error) reject(error);
                else resolve([requestParsed, responseParsed]);
            });
        });
    }

    private parseRequest(request: IncomingMessage): IRequest {
        let isChannel = _.startsWith(request.url, "pgoat://");
        return {
            url: !isChannel ? request.url : null,
            channel: isChannel ? request.url.substr(8) : null, //Remove pgoat://
            method: request.method,
            headers: request.headers,
            query: qs.parse(url.parse(request.url).query),
            params: null,
            body: (<any>request).body,
            originalRequest: request
        };
    }

    private parseResponse(response: ServerResponse): IResponse {
        let headers: Dictionary < string > = {};
        let statusCode = 200;

        return {
            header: (key: string, value: string) => {
                headers[key] = value;
            },

            status: (code: number) => {
                statusCode = code;
            },
            send: (data?: any) => {
                response.writeHead(statusCode, _.assign(headers, {
                    "Content-Type": "application/json; charset=utf-8"
                }));
                if (data)
                    response.write(JSON.stringify(data));
                response.end();
            },
            originalResponse: response
        };
    }

}

export default RequestParser