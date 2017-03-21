import "reflect-metadata";
import { Matcher } from "../scripts/matcher/Matcher";
import { SpecialNames } from "../scripts/matcher/SpecialNames";
import expect = require("expect.js");
import Identity from "../scripts/matcher/Identity";

describe("Given a Matcher", () => {
    let subject: Matcher;
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
    let definitionWithInit = {
        $init: () => 0
    };
    let definitionWithoutInit = {
        $any: (s: any, e: any) => 0
    };
    let definitionWithAnyAndDefault = {
        $any: (s: any, e: any) => 0,
        $default: (s: any, e: any) => 0
    };

    describe("when matching an event", () => {
        beforeEach(() => {
            subject = new Matcher(definitionWithWildcards);
        });

        context("and both $default and $any are defined", () => {
            beforeEach(() => subject = new Matcher(definitionWithAnyAndDefault));
            it("should raise an error", () => {
                expect(() => subject.match("notdefined")).to.throwError();
            });
        });

        context("and no match is found", () => {
            beforeEach(() => {
                subject = new Matcher(definitionWithoutWildcards);
            });

            it("should return an identity function", () => {
                let fn = subject.match("notfoo");
                expect(fn).to.be(Identity);
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
                    beforeEach(() => subject = new Matcher(definitionWithAny));
                    it("should return the $any member", () => {
                        expect(subject.match("notdefined")).to.be.a(Function);
                    });
                });

                context("and $default is defined", () => {
                    beforeEach(() => subject = new Matcher(definitionWithDefault));
                    it("should return the $default member", () => {
                        expect(subject.match("notdefined")).to.be.a(Function);
                    });
                });
            });
        });
    });

    context(`when requesting a match for ${SpecialNames.Any}`, () => {
        beforeEach(() => subject = new Matcher(definitionWithAny));
        it(`should find a match only if ${SpecialNames.Any} exists`, () => {
            expect(subject.match(SpecialNames.Any)).to.be.a(Function);
        });

        context(`and ${SpecialNames.Any} is not defined`, () => {
            beforeEach(() => subject = new Matcher(definitionWithDefault));
            it("should raise an error", () => {
                expect(() => subject.match(SpecialNames.Any)).to.throwError();
            });
        });
    });

    context(`when requesting a match for ${SpecialNames.Default}`, () => {
        beforeEach(() => subject = new Matcher(definitionWithDefault));
        it(`should find a match only if ${SpecialNames.Default} exists`, () => {
            expect(subject.match(SpecialNames.Default)).to.be.a(Function);
        });

        context(`and ${SpecialNames.Default} is not defined`, () => {
            beforeEach(() => subject = new Matcher(definitionWithAny));
            it("should raise an error", () => {
                expect(() => subject.match(SpecialNames.Default)).to.throwError();
            });
        });
    });

    context(`when requesting a match for ${SpecialNames.Init}`, () => {
        beforeEach(() => subject = new Matcher(definitionWithInit));
        it(`should find a match only if ${SpecialNames.Init} exists`, () => {
            expect(subject.match(SpecialNames.Init)).to.be.a(Function);
        });

        context(`and ${SpecialNames.Init} is not defined`, () => {
            beforeEach(() => subject = new Matcher(definitionWithoutInit));
            it("should return a default function returning an empty literal", () => {
                let found = subject.match(SpecialNames.Init);
                expect(found).to.be.a(Function);
                expect(found()).to.eql({});
            });
        });
    });


});
