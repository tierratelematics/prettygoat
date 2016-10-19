import "bluebird";
import "reflect-metadata";
import * as TypeMoq from "typemoq";
import expect = require("expect.js");
import {MemoizingMatcher} from "../scripts/matcher/MemoizingMatcher";
import {IMatcher} from "../scripts/matcher/IMatcher";
import {MockMatcher} from "./fixtures/MockMatcher";

describe("Given a MemoizingMatcher", () => {
    let subject:IMatcher,
        baseMatcher: TypeMoq.Mock<IMatcher>,
        testFn = (s, e) => s;

    describe("when matching an event", () => {
        beforeEach(() => {
            baseMatcher = TypeMoq.Mock.ofType<IMatcher>(MockMatcher);
            baseMatcher.setup(m => m.match("test")).returns(a => testFn);
            subject = new MemoizingMatcher(baseMatcher.object);
        });

        context("and an event of the same type has not already been processed", () => {
            it("should return the previous matching function", () => {
                let match = subject.match("test");
                expect(match).to.be(testFn);
                baseMatcher.verify(m => m.match("test"), TypeMoq.Times.once());
            });
        });

        context("and an event of the same type has already been processed", () => {
            it("should not call the base matcher anymore", () => {
                subject.match("test");
                baseMatcher.verify(m => m.match("test"), TypeMoq.Times.once());
                let match = subject.match("test");
                expect(match).to.be(testFn);
                baseMatcher.verify(m => m.match("test"), TypeMoq.Times.once());
            });
        });
    });
});
