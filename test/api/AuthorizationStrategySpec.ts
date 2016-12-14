import "bluebird";
import "reflect-metadata";
import expect = require("expect.js");
import IAuthorizationStrategy from "../../scripts/api/IAuthorizationStrategy";
import AuthorizationStrategy from "../../scripts/api/AuthorizationStrategy";
import * as TypeMoq from "typemoq";
import {Request} from "express";
import MockRequest from "../fixtures/express/MockRequest";


describe("Given an Authorization Strategy", () => {
    let tokenCollection: string[],
        token: string,
        request: TypeMoq.Mock<Request>,
        subject: IAuthorizationStrategy;

    beforeEach(
        () => {
            tokenCollection = ["6RSL11DR1OCFJ7P", "7toYUi5wtVFgrsr"];
            request = TypeMoq.Mock.ofType(MockRequest);
            subject = new AuthorizationStrategy(tokenCollection);
        }
    );

    context("when the api key isn't matched", () => {
        beforeEach(() => {
            request.setup(r => r.header("apiKey")).returns(o => "1234567890");
        });

        it("should not authorize it", () => {
            subject.authorize(request.object).then((authorized:boolean) => {
                expect(authorized).to.be.equal(false);
            });
            request.verify(r => r.header("apiKey"), TypeMoq.Times.once());
        });
    });

    context("when the api key is matched", () => {
        beforeEach(() => {
            request.setup(r => r.header("apiKey")).returns(o => "6RSL11DR1OCFJ7P");
        });

        it("should authorize it", () => {
            subject.authorize(request.object).then((authorized:boolean) => {
                expect(authorized).to.be.ok();
            });
            request.verify(r => r.header("apiKey"), TypeMoq.Times.once());
        });
    });

});