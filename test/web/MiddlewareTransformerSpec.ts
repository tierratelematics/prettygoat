import "reflect-metadata";
import expect = require("expect.js");
import * as TypeMoq from "typemoq";
import {IMiddleware, IMiddlewareTransformer} from "../../scripts/web/IRequestComponents";
import MockMiddleware from "../fixtures/web/MockMiddleware";
import MiddlewareTransformer from "../../scripts/web/MiddlewareTransformer";
const hammock = require("hammock");
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
            return subject.transform(new hammock.Request({}), new hammock.Response()).then(() => {
                middleware.verify(r => r.transform(anyValue, anyValue, anyValue), TypeMoq.Times.exactly(2));
            });
        });
    });
});