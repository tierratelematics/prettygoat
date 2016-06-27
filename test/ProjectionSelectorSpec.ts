import expect = require("expect.js");
import sinon = require("sinon");
import IProjectionSelector from "../scripts/projections/IProjectionSelector";
import ProjectionSelector from "../scripts/projections/ProjectionSelector";
import IProjectionHandlerFactory from "../scripts/projections/IProjectionHandlerFactory";
import AreaRegistry from "../scripts/registry/AreaRegistry";
import RegistryEntry from "../scripts/registry/RegistryEntry";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";
import SplitProjectionDefinition from "./fixtures/definitions/SplitProjectionDefinition";
import ProjectionHandlerFactory from "../scripts/projections/ProjectionHandlerFactory";
import {ProjectionHandler} from "../scripts/projections/ProjectionHandler";
import {Matcher} from "../scripts/matcher/Matcher";
import MockReadModelFactory from "./fixtures/MockReadModelFactory";
import SinonSpy = Sinon.SinonSpy;
import SinonStub = Sinon.SinonStub;
import SinonSandbox = Sinon.SinonSandbox;

describe("Projection selector, given some registered projections", () => {

    let subject:IProjectionSelector,
        projectionHandlerFactory:IProjectionHandlerFactory,
        handlerStub:SinonStub,
        sandbox:SinonSandbox,
        mockProjection = new MockProjectionDefinition().define(),
        splitProjection = new SplitProjectionDefinition().define(),
        mockHandler = new ProjectionHandler(
            mockProjection.name,
            new Matcher(mockProjection.definition),
            new MockReadModelFactory()),
        splitHandler = new ProjectionHandler(
            splitProjection.name,
            new Matcher(splitProjection.definition),
            new MockReadModelFactory());

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
        projectionHandlerFactory = new ProjectionHandlerFactory(null);
        handlerStub = sandbox.stub(projectionHandlerFactory, "create", (name, definition) => {
            return name === "test" ? mockHandler : splitHandler;
        });
        subject = new ProjectionSelector(projectionHandlerFactory);
        subject.addProjections(new AreaRegistry("Test", [
            new RegistryEntry(mockProjection, "Mock"),
            new RegistryEntry(splitProjection, "Split"),
        ]));
    });

    afterEach(() => sandbox.restore());

    context("at startup", () => {
        it("should create the projection handlers for those projections", () => {
            expect(handlerStub.calledTwice).to.be(true);
        });
    });

    context("when a new event is received", () => {
        it("should return a list of the matching projection handlers", () => {
            let handlers = subject.projectionsFor({type: "OnlyEvent", payload: null});
            expect(handlers).to.have.length(1);
            expect(handlers[0]).to.be(mockHandler);
        });

        context("and needs to be handled on a split projection", () => {
            it("should create the child projection and return the list of matching projection handlers", () => {
                subject.projectionsFor({
                    type: "TestEvent", payload: {
                        id: 10,
                        count: 30
                    }
                });
                let handlers = subject.projectionsFor({
                    type: "TestEvent", payload: {
                        id: 20,
                        count: 30
                    }
                });
                expect(handlers).to.have.length(1);
                expect(handlers[0].state).to.be(10);
            });
        });
    });

    context("when the state of a projection is needed", () => {
        context("and no split key is provided", () => {
            it("should return the right projection handler", () => {
                subject.projectionsFor({
                    type: "OnlyEvent", payload: null
                });
                let handler = subject.projectionFor("Test", "Mock");
                expect(handler.state).to.be(20);
            });
        });

        context("and a split key is provided", () => {
            it("should return the right split projection handler", () => {
                subject.projectionsFor({
                    type: "TestEvent", payload: {
                        id: 10,
                        count: 30
                    }
                });
                subject.projectionsFor({
                    type: "TestEvent", payload: {
                        id: 20,
                        count: 30
                    }
                });
                let handler = subject.projectionFor("Test", "Split", "10");
                expect(handler.state).to.be(10);
            });
        });
    });
});