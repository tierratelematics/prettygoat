import * as express from 'express';
import {Errback} from "express";

class MockResponse implements express.Response {
    public send: express.Send;
    public json: express.Send;
    public jsonp: express.Send;
    public headersSent: boolean;
    public locals: any;
    public charset: string;
    public statusCode: number;
    public statusMessage: string;
    public sendDate: boolean;
    public writable:boolean;

    status(code: number): express.Response {
        return this;
    }

    sendStatus(code: number): express.Response {
        return null;
    }

    links(links: any): express.Response {
        return null;
    }

    sendfile(path: string): void;
    sendfile(path: string, options: any): void;
    sendfile(path: string, fn: Errback): void;
    sendfile(path: string, options: any, fn: Errback): void;
    sendfile(path:string,...arg:any[]){
        return null;
    }


    sendFile(path: string): void;
    sendFile(path: string, options: any): void;
    sendFile(path: string, fn: Errback): void;
    sendFile(path: string, options: any, fn: Errback): void;
    sendFile(path:string,options?:any, fn?:any){
        return null;
    }

    download(path: string,filename?: string | express.Errback, fn?: express.Errback): void {
    }

    contentType(type: string): express.Response {
        return null;
    }

    type(type: string): express.Response {
        return null;
    }

    format(obj: any): express.Response {
        return null;
    }

    attachment(filename?: string): express.Response {
        return null;
    }


    set(field: any): express.Response;
    set(field: string, value?: string): express.Response;
    set(...args:any[]):express.Response{
        return null;
    }

    header(field: any): express.Response;
    header(field: any | string, value?: string): express.Response {
        return null;
    }

    get(field: string): string {
        return null;
    }

    clearCookie(name: string, options?: any): express.Response {
        return null;
    }


    cookie(name: string, val: string, options: express.CookieOptions): express.Response;
    cookie(name: string, val: any, options: express.CookieOptions): express.Response;
    cookie(name: string, val: any): express.Response;
    cookie(name:string,...args:any[]){
        return null;
    }

    location(url: string): express.Response {
        return null;
    }


    redirect(url: string): void;
    redirect(status: number, url: string): void;
    redirect(url: string, status: number): void;
    redirect(...args:any[]){
        return null;
    }

    render(view: string, options?: Object, callback?: (err: Error, html: string)=>void): void;
    render(view: string, callback?: (err: Error, html: string)=>void): void;
    render(view:string,...args:any[]): void{

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

    writeContinue(): void {
    }

    writeHead(statusCode: number, reasonPhrase?: string, headers?: any): void;
    writeHead(statusCode: number, headers?: any): void;
    writeHead(statusCode: number, ...args:any[]): void {
    }

    setHeader(name: string, value: string|string[]): void {
    }

    getHeader(name: string): string {
        return null;
    }

    removeHeader(name: string): void {
    }

    addTrailers(headers: any): void {
    }

    end(): void;
    end(buffer: Buffer, cb?: Function): void;
    end(str: string, cb?: Function): void;
    end(str: string, encoding?: string, cb?: Function): void;
    end(data?: any, encoding?: string): void;
    end(chunk: any, cb?: Function): void;
    end(chunk: any, encoding?: string, cb?: Function): void;
    end(data?:any,encoding?:any,cb?:any):void{

    }

    _write(chunk: any, encoding: string, callback: Function): void {
    }

    write(chunk: any, encoding?: string): any;
    write(buffer: Buffer): boolean;
    write(chunk: any, cb?: Function): boolean;
    write(chunk: any, encoding?: string, cb?: Function): boolean;
    write(...args:any[]):any{
        return null;
    }
}

export default MockResponse;