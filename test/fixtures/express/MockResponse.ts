import * as express from 'express';
import {Errback} from "express";
import {ServerResponse} from "http";
import * as net from "net";


class MockResponse{
    
    send: express.Send = function (body?: any): express.Response {
        return this;
    };

    json: express.Send = function (body: any): express.Response {
        return this;
    };

    jsonp: express.Send = function (body: any): express.Response {
        return this;
    };

    headers: any;

    status(code: number): express.Response {
        return null;
    }

    sendStatus(code: number): express.Response {
        return null;
    }

    header(field: any): express.Response;
    header(field: any | string, value?: string): express.Response {
        return null;
    }

    get(field: string): string {
        return null;
    }

    end(): void{

    }
}

export default MockResponse;