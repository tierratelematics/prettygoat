import "reflect-metadata";
import expect = require("expect.js");
import ILookupFactory from "../../scripts/lookup/ILookupFactory";
import LookupFactory from "../../scripts/lookup/LookupFactory";

describe("Given a lookup factory", () => {

    let subject: ILookupFactory;

    beforeEach(() => {
        subject = new LookupFactory(null);
    });

    context("when a lookup service is requested", () => {
        context("and it has not been created yet", () => {
            it("should be created", () => {
                expect(subject.lookupFor("UsersByDevice")).to.have.property("projectionName", "UsersByDevice");

            });
        });
        context("and it has already been created", () => {
            it("return the cached one", () => {
                let lookup = subject.lookupFor("UsersByDevice");

                expect(subject.lookupFor("UsersByDevice")).to.be(lookup);
            });
        });
    });
});