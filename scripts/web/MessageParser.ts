import {IncomingMessage} from "http";
import {ServerResponse} from "http";
import Dictionary from "../util/Dictionary";
import * as url from "url";
import * as qs from "qs";
import {IMessageParser, RequestData} from "./IRequestComponents";
import {injectable} from "inversify";
import * as _ from "lodash";

@injectable()
class MessageParser implements IMessageParser<IncomingMessage, ServerResponse> {

    parse(request: IncomingMessage, response: ServerResponse): RequestData {
        let isChannel = _.startsWith(request.url, "pgoat://");
        let requestParsed = {
            url: !isChannel ? request.url : null,
            channel: isChannel ? request.url.substr(8) : null, //Remove pgoat://
            method: request.method,
            headers: request.headers,
            query: qs.parse(url.parse(request.url).query),
            params: null,
            body: (<any>request).body,
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
    }

}

export default MessageParser