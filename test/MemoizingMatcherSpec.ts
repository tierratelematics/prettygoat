import "bluebird";
import "reflect-metadata";
import {Matcher} from "../scripts/matcher/Matcher";

import expect = require("expect.js");
import {MemoizingMatcher} from "../scripts/matcher/MemoizingMatcher";
import {IMatcher} from "../scripts/matcher/IMatcher";

describe("Given a MemoizingMatcher", () => {
    let subject:IMatcher,
        testFn = (s, e) => s;

    describe("when matching an event", () => {
        beforeEach(() => {
            subject = new MemoizingMatcher(new Matcher({"test": testFn}));
        });

        context("and an event of the same type has already been processed", () => {
            it("should return the previous matching function", () => {
                subject.match("test");
                let match = subject.match("test");
                expect(match).to.be(testFn);
            });
        });

        context("and an event of the same type has not already been processed", () => {
            it("should return the previous matching function", () => {
                let match = subject.match("test");
                expect(match).to.be(testFn);
            });
        });
    });
});
