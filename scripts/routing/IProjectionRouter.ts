import {IRouterMatcher} from "express";

interface IProjectionRouter {
    get:IRouterMatcher<IProjectionRouter>;
}

export default IProjectionRouter