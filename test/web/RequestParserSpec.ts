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
        context("and the request is coming from a channel", () => {
            it("should populate the channel", () => {
                let data = subject.parse(new hammock.Request({
                    url: "pgoat://readModels"
                }), new hammock.Response());
                expect(data[0].url).to.be(null);
                expect(data[0].channel).to.be("readModels");
            });
        });

        context("and the request is not coming from a channel", () => {
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
});