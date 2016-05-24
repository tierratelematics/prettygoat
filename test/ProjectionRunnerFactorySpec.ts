import "bluebird";
import "reflect-metadata";
import expect = require("expect.js");
import sinon = require("sinon");
import IProjectionRunnerFactory from "../scripts/projections/IProjectionRunnerFactory";
import ProjectionRunnerFactory from "../scripts/projections/ProjectionRunnerFactory";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";
import UnnamedProjectionDefinition from "./fixtures/definitions/UnnamedProjectionDefinition";

describe("ProjectionRunnerFactory, given a projection definition", () => {

    let subject:IProjectionRunnerFactory;

    beforeEach(() => {
        subject = new ProjectionRunnerFactory();
    });

    context("when all the required properties are defined", () => {
        it("should return a constructed projection", () => {
            let projectionRunner = subject.create(new MockProjectionDefinition());
            expect((<any>projectionRunner).streamId).to.eql("test");
        });
    });

    context("when not all the required properties are defined", () => {
        it("should throw an error", () => {
            expect(() => subject.create(new UnnamedProjectionDefinition())).to.throwError();
        });
    });
});