import "reflect-metadata";
import expect = require("expect.js");
import * as TypeMoq from "typemoq";
import {IRequestParser, IMiddleware} from "../../scripts/web/IRequestComponents";
import RequestParser from "../../scripts/web/RequestParser";
import MockMiddleware from "../fixtures/web/MockMiddleware";
const hammock = require("hammock");
const anyValue = TypeMoq.It.isAny();

describe("Given a request", () => {

    let subject: IRequestParser;
    let middleware: TypeMoq.Mock<IMiddleware>;

    beforeEach(() => {
        middleware = TypeMoq.Mock.ofType(MockMiddleware);
        middleware.setup(r => r.transform(anyValue, anyValue, anyValue)).returns((request, response, next) => {
            next();
        });
        subject = new RequestParser([middleware.object, middleware.object]);
    });

    context("when a list of middlewares is given", () => {
        it("should apply them", () => {
            return subject.parse(new hammock.Request({}), new hammock.Response()).then(() => {
                middleware.verify(r => r.transform(anyValue, anyValue, anyValue), TypeMoq.Times.exactly(2));
            });
        });
    });
});