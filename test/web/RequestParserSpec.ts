import "reflect-metadata";
import expect = require("expect.js");
import RequestParser from "../../scripts/web/RequestParser";
import {IRequestParser} from "../../scripts/web/IRequestComponents";
const hammock = require("hammock");

describe("Given a RequestParser", () => {

    let subject: IRequestParser;

    beforeEach(() => {
        subject = new RequestParser();
    });

    context("when parsing a new request", () => {
        it("should populate the url", () => {
            let data = subject.parse(new hammock.Request({
                url: "/test/projection"
            }), new hammock.Response());
            expect(data[0].url).to.be("/test/projection");
            expect(data[0].method).to.be("GET");
        });

        it("should trim the trailing slash", () => {
            let data = subject.parse(new hammock.Request({
                url: "/test/projection/"
            }), new hammock.Response());
            expect(data[0].url).to.be("/test/projection");
        });
    });
});
