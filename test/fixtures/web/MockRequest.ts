import {IRequest} from "../../../scripts/web/IRequestComponents";

export default class MockRequest implements IRequest {
    url = "";
    method = "";
    headers = {};
    query = {};
    params = {};
    body = {};
    originalRequest = null;

    constructor(url?: string, body?: any) {
        if (url)
            this.url = url;
        if (body)
            this.body = body;
    }
}