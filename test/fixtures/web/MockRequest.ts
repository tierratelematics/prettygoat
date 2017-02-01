import {IRequest} from "../../../scripts/web/IRequestComponents";

export default class MockRequest implements IRequest {
    channel = "";
    url = "";
    method = "";
    headers = {};
    query = {};
    params = {};
    body = {};
    originalRequest = null;

    constructor(url?: string, body?: any, channel?: string) {
        if (url)
            this.url = url;
        if (body)
            this.body = body;
        if (channel)
            this.channel = channel;
    }
}