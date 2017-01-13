import "bluebird";
import "reflect-metadata";
import expect = require("expect.js");
import IAuthorizationStrategy from "../../scripts/api/IAuthorizationStrategy";
import AuthorizationStrategy from "../../scripts/api/ApiKeyAuthorizationStrategy";
import * as TypeMoq from "typemoq";
import MockRequest from "../fixtures/express/MockRequest";
import IApiKeyConfig from "../../scripts/configs/IApiKeyConfig";


describe("Given an Authorization Strategy", () => {
    let config: IApiKeyConfig,
        request: TypeMoq.Mock<any>, //Casting due to express bundled types mismatch
        subject: IAuthorizationStrategy;

    beforeEach(
        () => {
            config = ["6RSL11DR1OCFJ7P", "7toYUi5wtVFgrsr"];
            request = TypeMoq.Mock.ofType(MockRequest);
            subject = new AuthorizationStrategy(config);
        }
    );

    context("when the api key isn't matched", () => {
        beforeEach(() => {
            request.setup(r => r.header("Authorization")).returns(o => "1234567890");
        });

        it("should not authorize it", () => {
            subject.authorize(request.object).then((authorized: boolean) => {
                expect(authorized).to.not.be.ok();
            });
            request.verify(r => r.header("Authorization"), TypeMoq.Times.once());
        });
    });

    context("when the api key is matched", () => {
        beforeEach(() => {
            request.setup(r => r.header("Authorization")).returns(o => "6RSL11DR1OCFJ7P");
        });

        it("should authorize it", () => {
            subject.authorize(request.object).then((authorized: boolean) => {
                expect(authorized).to.be.ok();
            });
            request.verify(r => r.header("Authorization"), TypeMoq.Times.once());
        });
    });

});