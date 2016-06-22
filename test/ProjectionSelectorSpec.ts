import expect = require("expect.js");
import sinon = require("sinon");
import IProjectionSelector from "../scripts/projections/IProjectionSelector";
import ProjectionSelector from "../scripts/projections/ProjectionSelector";
import IProjectionRegistry from "../scripts/registry/IProjectionRegistry";
import IProjectionRunnerFactory from "../scripts/projections/IProjectionRunnerFactory";
import AreaRegistry from "../scripts/registry/AreaRegistry";
import RegistryEntry from "../scripts/registry/RegistryEntry";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";
import SplitProjectionDefinition from "./fixtures/definitions/SplitProjectionDefinition";
import ProjectionRegistry from "../scripts/registry/ProjectionRegistry";
import ProjectionRunnerFactory from "../scripts/projections/ProjectionRunnerFactory";
import {ProjectionRunner} from "../scripts/projections/ProjectionRunner";
import IPushNotifier from "../scripts/push/IPushNotifier";
import PushNotifier from "../scripts/push/PushNotifier";
import PushContext from "../scripts/push/PushContext";
import {MockSnapshotRepository} from "./fixtures/MockSnapshotRepository";
import {Matcher} from "../scripts/matcher/Matcher";
import {MockStreamFactory} from "./fixtures/MockStreamFactory";
import MockReadModelFactory from "./fixtures/MockReadModelFactory";
import * as Rx from "rx";
import Event from "../scripts/streams/Event";
import SinonSpy = Sinon.SinonSpy;
import SinonStub = Sinon.SinonStub;
import SinonSandbox = Sinon.SinonSandbox;

describe("Projection selector, given some registered projections", () => {

    let subject:IProjectionSelector,
        registry:IProjectionRegistry,
        projectionRunnerFactory:IProjectionRunnerFactory,
        pushNotifier:IPushNotifier,
        runnerStub:SinonStub,
        pushStub:SinonStub,
        sandbox:SinonSandbox,
        mockProjection = new MockProjectionDefinition().define(),
        splitProjection = new SplitProjectionDefinition().define(),
        mockRunner = new ProjectionRunner(
            mockProjection,
            new MockStreamFactory(Rx.Observable.empty<Event>()),
            new MockSnapshotRepository(),
            new Matcher(mockProjection.definition),
            new MockReadModelFactory()),
        splitRunner = new ProjectionRunner(
            splitProjection,
            new MockStreamFactory(Rx.Observable.empty<Event>()),
            new MockSnapshotRepository(),
            new Matcher(splitProjection.definition),
            new MockReadModelFactory());

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
        registry = new ProjectionRegistry(null, null);
        projectionRunnerFactory = new ProjectionRunnerFactory(null, null, null);
        sandbox.stub(registry, "getAreas", () => [new AreaRegistry("Test", [
            new RegistryEntry(mockProjection, "Mock"),
            new RegistryEntry(splitProjection, "Split"),
        ])]);
        runnerStub = sandbox.stub(projectionRunnerFactory, "create", projection => {
            return projection.name === "test" ? mockRunner : splitRunner;
        });
        pushNotifier = new PushNotifier(null, null, null, null);
        pushStub = sandbox.stub(pushNotifier, "register");
        subject = new ProjectionSelector(registry, projectionRunnerFactory, pushNotifier);
    });

    afterEach(() => sandbox.restore());

    context("at startup", () => {
        it("should create the projection runners for those projections", () => {
            subject.initialize();
            expect(runnerStub.calledWith(mockProjection)).to.be(true);
            expect(runnerStub.calledWith(splitProjection)).to.be(true);
        });

        it("should register the created runners on the push notifier", () => {
            subject.initialize();
            expect(pushStub.calledWith(mockRunner, new PushContext("Test", "Mock"), undefined)).to.be(true);
            expect(pushStub.calledWith(splitRunner, new PushContext("Test", "Split"), undefined)).to.be(true);
        });
    });

    context("when a new event is received", () => {
        beforeEach(() => subject.initialize());
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
                expect(runners).to.have.length(2);
                expect(runners[0].state).to.be(10);
            });
        });
    });

    context("when the state of a split projection is needed", () => {
        it("should return the right projection runner", () => {
            let runner = subject.projectionFor("Test", "Mock", "10");
            expect(runner.state).to.be(10);
        });
    });
});