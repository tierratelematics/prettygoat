import "reflect-metadata";
import expect = require("expect.js");
import * as TypeMoq from "typemoq";
import {IMiddleware, IMiddlewareTransformer} from "../../scripts/web/IRequestComponents";
import MockMiddleware from "../fixtures/web/MockMiddleware";
import MiddlewareTransformer from "../../scripts/web/MiddlewareTransformer";
import MockResponse from "../fixtures/web/MockResponse";
import MockRequest from "../fixtures/web/MockRequest";
const anyValue = TypeMoq.It.isAny();

describe("Given a RequestTransformer", () => {

    let subject: IMiddlewareTransformer;
    let middleware: TypeMoq.Mock<IMiddleware>;

    beforeEach(() => {
        middleware = TypeMoq.Mock.ofType(MockMiddleware);
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
                middleware.verify(r => r.transform(TypeMoq.It.isValue(request), TypeMoq.It.isValue(response), anyValue), TypeMoq.Times.exactly(2));
            });
        });
    });
});