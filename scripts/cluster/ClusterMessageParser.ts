import {IncomingMessage} from "http";
import {ServerResponse} from "http";
import Dictionary from "../util/Dictionary";
import * as url from "url";
import * as qs from "qs";
import {IMessageParser, IRequest, IResponse} from "../web/IRequestComponents";
import {injectable} from "inversify";
import * as _ from "lodash";
const jsonBody = require("body/json");

@injectable()
class ClusterMessageParser implements IMessageParser<IncomingMessage, ServerResponse> {

    parse(request: IncomingMessage, response: ServerResponse): Promise<[IRequest, IResponse]> {
        return this.parseBody(request, response).then(body => {
            let requestParsed = {
                url: request.url,
                method: request.method,
                headers: request.headers,
                query: qs.parse(url.parse(request.url).query),
                params: null,
                body: body,
                originalRequest: request
            };

            let headers: Dictionary<string> = {};
            let statusCode = 200;

            let responseParsed = {
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

            return [requestParsed, responseParsed];
        });
    }

    private parseBody(request: IncomingMessage, response: ServerResponse): Promise<any> {
        return new Promise((resolve, reject) => {
            jsonBody(request, response, (error, body) => {
                if (error) reject(error);
                else resolve(body);
            });
        });
    }

}

export default ClusterMessageParser