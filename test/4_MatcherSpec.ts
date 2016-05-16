/// <reference path="../typings/main.d.ts" />
import { Matcher, EventMatch } from "../scripts/Matcher";
import expect = require("expect.js");

describe("Given a Matcher", () => {
    let subject: Matcher<EventMatch>;
    let definitionWithWildcards = {
        foo: (s: any, e: any) => 0,
        $any: (s: any, e: any) => 0,
        "foo*": (s: any, e: any) => 0
    };
    let definitionWithoutWildcards = {
        foo: (s: any, e: any) => 0
    };
    let definitionWithDefault = {
        $default: (s: any, e: any) => 0
    };
    let definitionWithAny = {
        $any: (s: any, e: any) => 0
    };
    let definitionWithAnyAndDefault = {
        $any: (s: any, e: any) => 0,
        $default: (s: any, e: any) => 0
    };

    describe("when matching an event", () => {
        beforeEach(() => {
            subject = new Matcher<EventMatch>(definitionWithWildcards);
        });
        context("and both $default and $any are defined", () => {
            beforeEach(() => subject = new Matcher<EventMatch>(definitionWithAnyAndDefault));
            it("should raise an error", () => {
               expect(() => subject.match("notdefined")).to.throwError();
            });
        });
        context("and no match is found", () => {
            beforeEach(() => {
                subject = new Matcher<EventMatch>(definitionWithoutWildcards);
            });

            it("should raise an error", () => {
                expect(() => subject.match("notfoo")).to.throwError();
            });
        });

        it("should find a match by full name if available", () => {
            expect(subject.match("foo")).to.be.a(Function);
        });

        context("and a match by full name is not available", () => {
            it("should find a match by partial name using wildcartds", () => {
                expect(subject.match("fooable")).to.be.a(Function);
            });

            context("and a match by wildcard is not available", () => {
                context("and $any is defined", () => {
                    beforeEach(() => subject = new Matcher<EventMatch>(definitionWithAny));
                    it("should return the $any member", () => {
                        expect(subject.match("notdefined")).to.be.a(Function);
                    });
                });
                context("and $default is defined", () => {
                    beforeEach(() => subject = new Matcher<EventMatch>(definitionWithDefault));
                    it("should return the $default member", () => {
                        expect(subject.match("notdefined")).to.be.a(Function);
                    });
                });
            });
        });
    });
    context("when requesting a match for $any", () => {
        beforeEach(() => subject = new Matcher<EventMatch>(definitionWithAny));
        it("should find a match only if $any exists", () => {
            expect(subject.match("$any")).to.be.a(Function);
        });
        context("and $any is not defined", () => {
            beforeEach(() => subject = new Matcher<EventMatch>(definitionWithDefault));
            it("should raise an error", () => {
                expect(() => subject.match("$any")).to.throwError();
            });
        });
    });
    context("when requesting a match for $default", () => {
        beforeEach(() => subject = new Matcher<EventMatch>(definitionWithDefault));
        it("should find a match only if $default exists", () => {
            expect(subject.match("$default")).to.be.a(Function);
        });
        context("and $default is not defined", () => {
           beforeEach(() => subject = new Matcher<EventMatch>(definitionWithAny));
           it("should raise an error", () => {
               expect(() => subject.match("$default")).to.throwError();
           });
        });
    });
});
