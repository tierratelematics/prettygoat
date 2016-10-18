import "bluebird";
import "reflect-metadata";
import expect = require("expect.js");
import sinon = require("sinon");
import * as TypeMoq from "typemoq";
import IProjectionRegistry from "../scripts/registry/IProjectionRegistry";
import ProjectionRegistry from "../scripts/registry/ProjectionRegistry";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";
import SinonStub = Sinon.SinonStub;
import UnnamedProjectionDefinition from "./fixtures/definitions/UnnamedProjectionDefinition";
import MockBadProjectionDefinition from "./fixtures/definitions/MockBadProjectionDefinition";
import {ProjectionAnalyzer} from "../scripts/projections/ProjectionAnalyzer";
import MockObjectContainer from "./fixtures/MockObjectContainer";
import IProjectionRunner from "../scripts/projections/IProjectionRunner";
import {ProjectionRunner} from "../scripts/projections/ProjectionRunner";
import IObjectContainer from "../scripts/bootstrap/IObjectContainer";
import IProjectionDefinition from "../scripts/registry/IProjectionDefinition";
import ITickScheduler from "../scripts/ticks/ITickScheduler";
import TickScheduler from "../scripts/ticks/TickScheduler";

describe("ProjectionRegistry, given a list of projection definitions", () => {

    let subject:IProjectionRegistry,
        runner:IProjectionRunner<number>,
        objectContainer:TypeMoq.Mock<IObjectContainer>,
        tickScheduler:ITickScheduler;

    beforeEach(() => {
        runner = new ProjectionRunner<number>("test", null, null, null);
        let analyzer = new ProjectionAnalyzer();
        objectContainer = TypeMoq.Mock.ofType(MockObjectContainer);
        tickScheduler = new TickScheduler();
        subject = new ProjectionRegistry(analyzer, objectContainer.object, tickScheduler);
    });

    context("when they are registered under a specific area", () => {

        it("should register the projection handler with the right contexts", () => {
            let key = "prettygoat:definitions:Admin:Mock";
            objectContainer.setup(o => o.contains(key)).returns(a => true);
            objectContainer.setup(o => o.get(key)).returns(a => new MockProjectionDefinition());

            subject.add(MockProjectionDefinition).forArea("Admin");
            let areas = subject.getAreas();

            expect(areas[0].area).to.be("Admin");
        });

        it("should pass base services to the definition", () => {
            let key = "prettygoat:definitions:Admin:Mock";
            objectContainer.setup(o => o.contains(key)).returns(a => true);
            let projectionDefinition:TypeMoq.Mock<IProjectionDefinition<number>> = TypeMoq.Mock.ofType(MockProjectionDefinition);
            objectContainer.setup(o => o.get(key)).returns(a => projectionDefinition.object);
            projectionDefinition.setup(p => p.define(TypeMoq.It.isValue(tickScheduler))).returns(a => {
                return {name: "test", definition: {}};
            });
            subject.add(MockProjectionDefinition).forArea("Admin");

            projectionDefinition.verify(p => p.define(TypeMoq.It.isValue(tickScheduler)), TypeMoq.Times.once());
        });
    });

    context("when a projection has no name", () => {
        beforeEach(() => {
            let key = "prettygoat:definitions:Test:";
            objectContainer.setup(o => o.contains(key)).returns(a => true);
            objectContainer.setup(o => o.get(key)).returns(a => new UnnamedProjectionDefinition());
        });
        it("should throw an error regarding the missing decorator", () => {
            expect(() => subject.add(UnnamedProjectionDefinition).forArea("Test")).to.throwError();
        });
    });

    context("when a projection isn't formally correct", () => {
        beforeEach(() => {
            let key = "prettygoat:definitions:Test:Mock";
            objectContainer.setup(o => o.contains(key)).returns(a => true);
            objectContainer.setup(o => o.get(key)).returns(a => new MockBadProjectionDefinition());
        });
        it("should throw an error", () => {
            expect(() => subject.add(MockBadProjectionDefinition).forArea("Test")).to.throwError();
        });
    });

    context("when the projection corresponding to the index page has to be registered", () => {
        beforeEach(() => {
            let key = "prettygoat:definitions:Index:Mock";
            objectContainer.setup(o => o.contains(key)).returns(a => true);
            objectContainer.setup(o => o.get(key)).returns(a => new MockProjectionDefinition());
        });
        it("should be registered with a default area name", () => {
            subject.index(MockProjectionDefinition);
            let areas = subject.getAreas();

            expect(areas[0].area).to.be("Index");
        });
    });

    context("when the projection corresponding to the master page has to be registered", () => {
        beforeEach(() => {
            let key = "prettygoat:definitions:Master:Mock";
            objectContainer.setup(o => o.contains(key)).returns(a => true);
            objectContainer.setup(o => o.get(key)).returns(a => new MockProjectionDefinition());
        });
        it("should be registered with a default area name", () => {
            subject.master(MockProjectionDefinition);
            let areas = subject.getAreas();

            expect(areas[0].area).to.be("Master");
        });
    });

    context("when a projection needs to be retrieved", () => {
        beforeEach(() => {
            let key = "prettygoat:definitions:Admin:Mock";
            objectContainer.setup(o => o.contains(key)).returns(a => true);
            objectContainer.setup(o => o.get(key)).returns(a => new MockProjectionDefinition());
            subject.add(MockProjectionDefinition).forArea("Admin")
        });

        context("and I supply the stream name", () => {
            it("should retrieve it", () => {
                let entry = subject.getEntry("test");

                expect(entry.data.projection.name).to.be("test");
            });
        });

        context("and I supply the registered projection name", () => {
            it("should retrieve it", () => {
                let entry = subject.getEntry("Mock", "Admin");

                expect(entry.data.projection.name).to.be("test");
            });
        });
    });
});