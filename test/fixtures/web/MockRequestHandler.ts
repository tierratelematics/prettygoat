import {IRequestHandler} from "../../../scripts/web/IRequestComponents";
import {Request, Response} from "express";
import Route from "../../../scripts/web/RouteDecorator";

@Route("GET", "/test")
export class MockRequestHandler implements IRequestHandler {

    handle(request: Request, response: Response) {
        //Access request in order to test handler call
        request.get("");
    }

    keyFor(request: Request): string {
        return "testkey";
    }

}

@Route("GET", "/foo/:id")
export class ParamRequestHandler implements IRequestHandler {

    handle(request: Request, response: Response) {
        //Access request in order to test handler call
        request.get("");
    }

    keyFor(request: Request): string {
        return "testkey";
    }

}