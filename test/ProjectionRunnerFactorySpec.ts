import "bluebird";
import "reflect-metadata";
import expect = require("expect.js");
import sinon = require("sinon");
import IProjectionRunnerFactory from "../scripts/projections/IProjectionRunnerFactory";
import ProjectionRunnerFactory from "../scripts/projections/ProjectionRunnerFactory";

describe("ProjectionRunnerFactory, given a projection definition", () => {

    let subject:IProjectionRunnerFactory;

    beforeEach(() => {
        subject = new ProjectionRunnerFactory(null);
    });

    context("when all the required properties are defined", () => {
        it("should return a constructed projection", () => {
            let projectionRunner = subject.create("test", {
                $init: () => 10,
                OnlyEvent: (s, e) => s
            });
            expect((<any>projectionRunner).projectionName).to.eql("test");
        });
    });
});