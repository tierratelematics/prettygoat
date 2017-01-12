import IProjectionRouter from "../../scripts/routing/IProjectionRouter";
import {IRouterMatcher} from "express";
import {RequestHandler} from "express";

class MockProjectionRouter implements IProjectionRouter {

    get:IRouterMatcher<IProjectionRouter> = (name:string | RegExp, ...handlers:RequestHandler[]):IProjectionRouter => {
        return this;
    }

}

export default MockProjectionRouter