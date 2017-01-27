import {IncomingMessage} from "http";
const Request = require("hammock").Request;

class RequestBuilder {

    static buildChannelMessage(channel: string, payload: any): IncomingMessage {
        let request = new Request({url: `pgoat://${channel}`});
        request.end(JSON.stringify(payload));
        return request;
    }
}

export default RequestBuilder