import "bluebird";
import "reflect-metadata";
import expect = require("expect.js");
import IAuthorizationStrategy from "../../scripts/api/authorization/IAuthorizationStrategy";
import AuthorizationStrategy from "../../scripts/api/authorization/AuthorizationStrategy";

describe("Given a Authorization Strategy", () => {
    let tokenCollection: string[],
        token: string,
        subject: IAuthorizationStrategy;

    beforeEach(
        () => {
            tokenCollection = ["6RSL11DR1OCFJ7P", "7toYUi5wtVFgrsr"];
            subject = new AuthorizationStrategy(tokenCollection);
        }
    );

    context("when token isn't matched", () => {
        beforeEach(() => token = "1234567890");

        it("should not authorize it", () => {
            expect(subject.authorize(token)).to.be.equal(false);
        });
    });

    context("when token is matched", () => {
        beforeEach(() => token = "6RSL11DR1OCFJ7P");

        it("should authorize it", () => {
            expect(subject.authorize(token)).to.be.ok();
        });
    });

});