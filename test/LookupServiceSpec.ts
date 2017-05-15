import "reflect-metadata";
import expect = require("expect.js");

describe("Given a lookup service", () => {

    context("when a lookup is request", () => {
        context("and the backing projection has been already requested", () => {
            it("should filter the model from the cache");
        });
        context("and the backing projection hasn't been requested yet", () => {
            it("should subscribe to it and get the model");
        });
    });
});