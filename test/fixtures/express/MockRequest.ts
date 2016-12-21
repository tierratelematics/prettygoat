import * as express from 'express';
import * as net from "net";
import {Readable} from "stream";

class MockRequest{

    headers: {};
    body: any;
    params: any;
    query: any;

    get(name: string): string {
        return null;
    }

    header(name: string): string {
        return null;
    }
}

export default MockRequest;