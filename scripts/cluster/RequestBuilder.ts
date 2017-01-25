import {IncomingMessage} from "http";
const Request = require("hammock").Request;

class RequestBuilder {

    static build(channel: string, payload: any): IncomingMessage {
        let request = new Request({url: `pgoat://${channel}`});
        request.end(payload);
        return request
    }
}

export default RequestBuilder