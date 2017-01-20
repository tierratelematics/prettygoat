import {Request} from "express";

export class MockRequest {

    headers: {};
    body: any;
    params: any;
    query: any;
    originalUrl: string;

    get(name: string): string {
        return null;
    }

    header(name: string): string {
        return null;
    }
}

//Factory function used to avoid the implementation of the huge express request interface
export function createMockRequest(url?: string): Request {
    let req = <Request><any>new MockRequest();
    req.url = url;
    return req;
}