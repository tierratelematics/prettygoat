import expect = require("expect.js");
import sinon = require("sinon");
import IProjectionRegistry from "../scripts/registry/IProjectionRegistry";
import ProjectionRegistry from "../scripts/registry/ProjectionRegistry";

describe("ProjectionRegistry, given a list of projections", () => {

    let subject:IProjectionRegistry;

    beforeEach(() => {
        subject = new ProjectionRegistry();
    });

    context("when they are registered under a specific area", () => {
        it("should register the projection runners with the right contexts");
    });

    context("when a registration is overridden", () => {
        it("should not duplicate the entry");
    });

    context("when a projection has no name", () => {
        it("should throw an error regarding the missing decorator");
    });

    context("when the projection corresponding to the index page has to be registered", () => {
        it("should be registered with a default area name");
    });

    context("when the projection corresponding to the master page has to be registered", () => {
        it("should be registered with a default area name");
    });
});