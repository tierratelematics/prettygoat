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
        this.url = url;
        this.body = body;
        this.channel = channel;
    }
}