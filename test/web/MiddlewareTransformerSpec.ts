import "reflect-metadata";
import expect = require("expect.js");
import {Mock, IMock, Times, It} from "typemoq";
import {IMiddleware, IMiddlewareTransformer} from "../../scripts/web/IRequestComponents";
import MiddlewareTransformer from "../../scripts/web/MiddlewareTransformer";
import MockResponse from "../fixtures/web/MockResponse";
import MockRequest from "../fixtures/web/MockRequest";
const anyValue = It.isAny();

describe("Given a RequestTransformer", () => {

    let subject: IMiddlewareTransformer;
    let middleware: IMock<IMiddleware>;

    beforeEach(() => {
        middleware = Mock.ofType<IMiddleware>();
        middleware.setup(r => r.transform(anyValue, anyValue, anyValue)).returns((request, response, next) => {
            next();
        });
        subject = new MiddlewareTransformer([middleware.object, middleware.object]);
    });

    context("when a list of middlewares is given", () => {
        it("should apply them", () => {
            let request = new MockRequest();
            let response = new MockResponse();
            return subject.transform(request, response).then(() => {
                middleware.verify(r => r.transform(It.isValue(request), It.isValue(response), anyValue), Times.exactly(2));
            });
        });
    });
});