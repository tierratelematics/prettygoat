import "bluebird";
import "reflect-metadata";
import expect = require("expect.js");
import sinon = require("sinon");
import IProjectionRegistry from "../scripts/registry/IProjectionRegistry";
import ProjectionRegistry from "../scripts/registry/ProjectionRegistry";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";
import IPushNotifier from "../scripts/push/IPushNotifier";
import PushNotifier from "../scripts/push/PushNotifier";
import SinonStub = Sinon.SinonStub;
import UnnamedProjectionDefinition from "./fixtures/definitions/UnnamedProjectionDefinition";
import {ProjectionRunner} from "../scripts/projections/ProjectionRunner";
import IProjectionRunner from "../scripts/projections/IProjectionRunner";
import MockBadProjectionDefinition from "./fixtures/definitions/MockBadProjectionDefinition";
import {ProjectionAnalyzer} from "../scripts/projections/ProjectionAnalyzer";
import MockObjectContainer from "./fixtures/MockObjectContainer";

describe("ProjectionRegistry, given a list of projection definitions", () => {

    let subject:IProjectionRegistry,
        runner:IProjectionRunner<number>;

    beforeEach(() => {
        runner = new ProjectionRunner<number>(new MockProjectionDefinition().define(), null, null, null, null);
        let analyzer = new ProjectionAnalyzer();
        subject = new ProjectionRegistry(analyzer, new MockObjectContainer());
    });

    context("when they are registered under a specific area", () => {
        it("should register the projection runners with the right contexts", () => {
            subject.add(MockProjectionDefinition).forArea("Admin");
            let areas = subject.getAreas();

            expect(areas[0].area).to.be("Admin");
        });
    });

    context("when a projection has no name", () => {
        it("should throw an error regarding the missing decorator", () => {
            expect(() => subject.add(UnnamedProjectionDefinition).forArea("Test")).to.throwError();
        });
    });

    context("when a projection isn't formally correct", () => {
        it("should throw an error", () => {
            expect(() => subject.add(MockBadProjectionDefinition).forArea("Test")).to.throwError();
        });
    });

    context("when the projection corresponding to the index page has to be registered", () => {
        it("should be registered with a default area name", () => {
            subject.index(MockProjectionDefinition);
            let areas = subject.getAreas();

            expect(areas[0].area).to.be("Index");
        });
    });

    context("when the projection corresponding to the master page has to be registered", () => {
        it("should be registered with a default area name", () => {
            subject.master(MockProjectionDefinition);
            let areas = subject.getAreas();

            expect(areas[0].area).to.be("Master");
        });
    });
});