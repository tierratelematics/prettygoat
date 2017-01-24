import {IMessageParser, IRequest, IResponse} from "./IRequestComponents";
import {Request, Response} from "express";
import {injectable} from "inversify";

@injectable()
class HttpMessageParser implements IMessageParser<Request, Response> {

    parse(request: Request, response: Response): [IRequest, IResponse] {
        let requestParsed = {
            url: request.url,
            method: request.method,
            headers: request.headers,
            query: request.query,
            params: null,
            body: request.body,
            originalRequest: request
        };

        let responseParsed = {
            header: (key: string, value: string) => {
                response.header(key, value);
            },

            status: (code: number) => {
                response.status(code);
            },
            send: (data: any) => {
                if (data)
                    response.json(data);
                else
                    response.end();
            },
            originalResponse: response
        };

        return [requestParsed, responseParsed];
    }

}

export default HttpMessageParser