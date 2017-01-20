import {Response, Send} from "express";

class MockResponse {

    send: Send = function (body?: any): Response {
        return this;
    };

    json: Send = function (body: any): Response {
        return this;
    };

    jsonp: Send = function (body: any): Response {
        return this;
    };

    headers: any;

    status(code: number): Response {
        return <Response><any>this;
    }

    sendStatus(code: number): Response {
        return null;
    }

    header(field: any): Response;
    header(field: any | string, value?: string): Response {
        return null;
    }

    get(field: string): string {
        return null;
    }

    end(): void {

    }
}

//Factory function used to avoid the implementation of the huge express response interface
export function createMockResponse(): Response {
    return <Response><any>new MockResponse();
}