import "bluebird";
import "reflect-metadata";
import expect = require("expect.js");
import sinon = require("sinon");
import IProjectionHandlerFactory from "../scripts/projections/IProjectionHandlerFactory";
import ProjectionHandlerFactory from "../scripts/projections/ProjectionHandlerFactory";

describe("ProjectionHandlerFactory, given a projection definition", () => {

    let subject:IProjectionHandlerFactory;

    beforeEach(() => {
        subject = new ProjectionHandlerFactory(null);
    });

    context("when all the required properties are defined", () => {
        it("should return a constructed projection", () => {
            let projectionHandler = subject.create("test", {
                $init: () => 10,
                OnlyEvent: (s, e) => s
            });
            expect((<any>projectionHandler).projectionName).to.eql("test");
        });
    });
});