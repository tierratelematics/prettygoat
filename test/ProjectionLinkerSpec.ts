import expect = require("expect.js");
import sinon = require("sinon");
import IProjectionLinker from "../scripts/projections/IProjectionLinker";
import ProjectionLinker from "../scripts/projections/ProjectionLinker";
import IProjectionRunner from "../scripts/projections/IProjectionRunner";
import {IProjection} from "../scripts/projections/IProjection";
import LinkedProjectionDefinition from "./fixtures/definitions/LinkedProjectionDefinition";
import MockProjectionRunner from "./fixtures/MockProjectionRunner";

describe("ProjectionLinker, given a projection", () => {

    let subject:IProjectionLinker,
        projection:IProjection<number>;

    beforeEach(() => {
        subject = new ProjectionLinker();
        projection = new LinkedProjectionDefinition().define();
    });

    context("when an external projection is listed as a dependency", () => {
        it("should emit the external projection state as en event", () => {
            subject.link(projectionRunner).to(projection.dependencies);
        });

        context("and that projection is linked to another one", () => {
            it("should resolve correctly the state of the projections", () => {

            });
        });
    });

});