import * as express from 'express';
import * as net from "net";

class MockRequest implements express.Request{

    headers: { [key: string]: string; };
    path: string;
    hostname: string;
    host: string;
    fresh: boolean;
    stale: boolean;
    xhr: boolean;
    body: any;
    cookies: any;
    method: string;
    params: any;
    user: any;
    authenticatedUser: any;
    query: any;
    route: any;
    signedCookies: any;
    originalUrl: string;
    baseUrl: string;
    app: express.Application;
    connection: net.Socket;
    httpVersion: string;
    rawHeaders: string[];
    trailers: any;
    rawTrailers: any;
    url: string;
    statusCode: number;
    statusMessage: string;
    socket: net.Socket;
    readable:boolean;
    accepted: express.MediaType[];
    protocol: string;
    secure: boolean;
    ip: string;
    ips: string[];
    subdomains: string[];

    get(name: string): string {
        return null;
    }

    header(name: string): string {
        return null;
    }


    accepts(arg: string | string[]): any
    {
        return null;
    }

    acceptsCharsets(charset?: string|string[]): string[] {
        return null;
    }

    acceptsEncodings(encoding?: string|string[]): string[] {
        return null;
    }

    acceptsLanguages(lang?: string|string[]): string[] {
        return null;
    }

    range(size: number): any[] {
        return null;
    }

    param(name: string, defaultValue?: any): string {
        return null;
    }

    is(type: string): boolean {
        return null;
    }

    clearCookie(name: string, options?: any): express.Response {
        return null;
    }

    addListener(event: string, listener: Function): this {
        return null;
    }

    on(event: string, listener: Function): this {
        return null;
    }

    once(event: string, listener: Function): this {
        return null;
    }

    removeListener(event: string, listener: Function): this {
        return null;
    }

    removeAllListeners(event?: string): this {
        return null;
    }

    setMaxListeners(n: number): this {
        return null;
    }

    getMaxListeners(): number {
        return null;
    }

    listeners(event: string): Function[] {
        return null;
    }

    emit(event: string, ...args): boolean {
        return null;
    }

    listenerCount(type: string): number {
        return null;
    }

    setTimeout(msecs: number, callback: Function): NodeJS.Timer {
        return null;
    }

    _read(size: number): void {
    }

    read(size?: number): any {
        return null;
    }

    setEncoding(encoding: string): void {
    }

    pause(): void {
    }

    resume(): void {
    }

    pipe<T extends NodeJS.WritableStream>(destination: T, options?: {end?: boolean}): T {
        return null;
    }

    unpipe<T extends NodeJS.WritableStream>(destination?: T): void {
    }

    unshift(chunk: any): void {
    }

    wrap(oldStream: NodeJS.ReadableStream): NodeJS.ReadableStream {
        return null;
    }

    push(chunk: any, encoding?: string): boolean {
        return null;
    }

}

export default MockRequest;