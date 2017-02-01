import "reflect-metadata";
import expect = require("expect.js");
import IAuthorizationStrategy from "../../scripts/api/IAuthorizationStrategy";
import AuthorizationStrategy from "../../scripts/api/AuthorizationStrategy";
import IAuthorizationConfig from "../../scripts/configs/IApiKeyConfig";
import {IRequest} from "../../scripts/web/IRequestComponents";
import MockRequest from "../fixtures/web/MockRequest";

describe("Given an Authorization Strategy", () => {

    let tokenCollection: IAuthorizationConfig,
        request: IRequest,
        subject: IAuthorizationStrategy;

    beforeEach(() => {
        tokenCollection = ["6RSL11DR1OCFJ7P", "7toYUi5wtVFgrsr"];
        request = new MockRequest();
        subject = new AuthorizationStrategy(tokenCollection);
    });

    context("when the api key isn't matched", () => {
        beforeEach(() => {
            request.headers["authorization"] = "1234567890";
        });

        it("should not authorize it", () => {
            return subject.authorize(request).then(authorized => {
                expect(authorized).to.be(false);
            });
        });
    });

    context("when the api key is matched", () => {
        beforeEach(() => {
            request.headers["authorization"] = "6RSL11DR1OCFJ7P";
        });

        it("should authorize it", () => {
            return subject.authorize(request).then(authorized => {
                expect(authorized).to.be(true);
            });
        });
    });

});