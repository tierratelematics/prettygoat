import expect = require("expect.js");
import sinon = require("sinon");
import IProjectionSelector from "../scripts/projections/IProjectionSelector";
import ProjectionSelector from "../scripts/projections/ProjectionSelector";
import IProjectionRunnerFactory from "../scripts/projections/IProjectionRunnerFactory";
import AreaRegistry from "../scripts/registry/AreaRegistry";
import RegistryEntry from "../scripts/registry/RegistryEntry";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";
import SplitProjectionDefinition from "./fixtures/definitions/SplitProjectionDefinition";
import ProjectionRunnerFactory from "../scripts/projections/ProjectionRunnerFactory";
import {ProjectionRunner} from "../scripts/projections/ProjectionRunner";
import IPushNotifier from "../scripts/push/IPushNotifier";
import PushNotifier from "../scripts/push/PushNotifier";
import PushContext from "../scripts/push/PushContext";
import {Matcher} from "../scripts/matcher/Matcher";
import MockReadModelFactory from "./fixtures/MockReadModelFactory";
import SinonSpy = Sinon.SinonSpy;
import SinonStub = Sinon.SinonStub;
import SinonSandbox = Sinon.SinonSandbox;

describe("Projection selector, given some registered projections", () => {

    let subject:IProjectionSelector,
        projectionRunnerFactory:IProjectionRunnerFactory,
        pushNotifier:IPushNotifier,
        runnerStub:SinonStub,
        pushStub:SinonStub,
        sandbox:SinonSandbox,
        mockProjection = new MockProjectionDefinition().define(),
        splitProjection = new SplitProjectionDefinition().define(),
        mockRunner = new ProjectionRunner(
            mockProjection.name,
            new Matcher(mockProjection.definition),
            new MockReadModelFactory()),
        splitRunner = new ProjectionRunner(
            splitProjection.name,
            new Matcher(splitProjection.definition),
            new MockReadModelFactory());

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
        projectionRunnerFactory = new ProjectionRunnerFactory(null);
        runnerStub = sandbox.stub(projectionRunnerFactory, "create", (name, definition) => {
            return name === "test" ? mockRunner : splitRunner;
        });
        pushNotifier = new PushNotifier(null, null, null, null, null);
        pushStub = sandbox.stub(pushNotifier, "register");
        subject = new ProjectionSelector(projectionRunnerFactory, pushNotifier);
        subject.addProjections(new AreaRegistry("Test", [
            new RegistryEntry(mockProjection, "Mock"),
            new RegistryEntry(splitProjection, "Split"),
        ]));
    });

    afterEach(() => sandbox.restore());

    context("at startup", () => {
        it("should create the projection runners for those projections", () => {
            expect(runnerStub.calledTwice).to.be(true);
        });

        it("should register the created runners on the push notifier", () => {
            expect(pushStub.calledWith(mockRunner, new PushContext("Test", "Mock"), undefined)).to.be(true);
            expect(pushStub.calledWith(splitRunner, new PushContext("Test", "Split"), undefined)).to.be(true);
        });
    });

    context("when a new event is received", () => {
        it("should return a list of the matching projection runners", () => {
            let runners = subject.projectionsFor({type: "OnlyEvent", payload: null});
            expect(runners).to.have.length(1);
            expect(runners[0]).to.be(mockRunner);
        });

        context("and needs to be handled on a split projection", () => {
            it("should create the child projection and return the list of matching projection runners", () => {
                subject.projectionsFor({
                    type: "TestEvent", payload: {
                        id: 10,
                        count: 30
                    }
                });
                let runners = subject.projectionsFor({
                    type: "TestEvent", payload: {
                        id: 20,
                        count: 30
                    }
                });
                expect(runners).to.have.length(1);
                expect(runners[0].state).to.be(10);
            });
        });
    });

    context("when the state of a projection is needed", () => {
        context("and no split key is provided", () => {
            it("should return the right projection runner", () => {
                subject.projectionsFor({
                    type: "OnlyEvent", payload: null
                });
                let runner = subject.projectionFor("Test", "Mock");
                expect(runner.state).to.be(20);
            });
        });

        context("and a split key is provided", () => {
            it("should return the right split projection runner", () => {
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
                let runner = subject.projectionFor("Test", "Split", "10");
                expect(runner.state).to.be(10);
            });
        });
    });
});