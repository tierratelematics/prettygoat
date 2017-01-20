import {IRequestHandler} from "../../../scripts/web/IRequestComponents";
import Methods from "../../../scripts/web/Methods";
import {Request, Response} from "express";
import Route from "../../../scripts/web/RouteDecorator";

@Route(Methods.Get, "/test")
export default class MockRequestHandler implements IRequestHandler {

    handle(request: Request, response: Response) {
        //Access request in order to test handler call
        request.get("");
    }

    keyFor(request: Request): string {
        return "testkey";
    }

}