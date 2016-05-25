import "bluebird";
import "reflect-metadata";
import expect = require("expect.js");
import sinon = require("sinon");
import IProjectionEngine from "../scripts/projections/IProjectionEngine";
import ProjectionEngine from "../scripts/projections/ProjectionEngine";
import IProjectionRegistry from "../scripts/registry/IProjectionRegistry";
import SinonStub = Sinon.SinonStub;
import ProjectionRegistry from "../scripts/registry/ProjectionRegistry";
import ProjectionRunnerFactory from "../scripts/projections/ProjectionRunnerFactory";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";
import PushNotifier from "../scripts/push/PushNotifier";
import {Matcher} from "../scripts/matcher/Matcher";
import {ProjectionRunner} from "../scripts/projections/ProjectionRunner";
import IProjectionRunner from "../scripts/projections/IProjectionRunner";
import IPushNotifier from "../scripts/push/IPushNotifier";
import {ProjectionAnalyzer} from "../scripts/projections/ProjectionAnalyzer";
import PushContext from "../scripts/push/PushContext";
import IProjectionRunnerFactory from "../scripts/projections/IProjectionRunnerFactory";

describe("Given a ProjectionEngine", () => {
    context("when registering a new projection", () => {
        it("should check for its formal correctness");
        it("should analyze its definition");
        context("and the projection is invalid", () => {
            it("should signal an error");
            it("should state why the projection is invalid");
        });
    });
    context("when running a projection", () => {
        it("should subscribe to the event stream according to the definition");
        context("and an error occurs when subscribing to the event stream", () => {
            it("should publish an error state");
        });
        it("should initialize the state of the projection");
        it("should publish the initial state of the projection");
        context("and an error occurs when initializing the state of the projection", () => {
            it("should unsubscribe to the event stream");
            it("should publish an error state");
        });
        context("and an event is received from the stream", () => {
            it("should match the event coming from the stream with a definition from the projection");
            it("should apply the event to the projection with respect to the given state");
            it("should check if a snapshot is needed");
            context("and a snapshot is needed", () => {
                it("should save a snapshot of the state");
                context("and an error occurs when saving the snapshot", () => {
                    it("should keep processing events");
                });
            });
            it("should publish the new state of the projection");
            context("and an error occurs when applying the event to the projection", () => {
                it("should unsubscribe to the event stream");
                it("should publish an error state");
            });
        });
    });

    let subject:IProjectionEngine,
        registry:IProjectionRegistry,
        runnerFactory:IProjectionRunnerFactory,
        registryStub:SinonStub,
        runnerFactoryStub:SinonStub,
        pushNotifier:IPushNotifier,
        notifyStub:SinonStub,
        projectionRunnerFactory:IProjectionRunnerFactory,
        runner:IProjectionRunner<number>;

    beforeEach(() => {
        runner = new ProjectionRunner<number>("test", null, null, new Matcher({}));
        pushNotifier = new PushNotifier(null, null, null);
        projectionRunnerFactory = new ProjectionRunnerFactory();
        registry = new ProjectionRegistry(new ProjectionAnalyzer());
        runnerFactory = new ProjectionRunnerFactory();
        subject = new ProjectionEngine(runnerFactory, pushNotifier, registry);
        notifyStub = sinon.stub(pushNotifier, "register", () => {
        });
        runnerFactoryStub= sinon.stub(projectionRunnerFactory, "create", () => runner);
    });

    afterEach(() => {
        registryStub.restore();
        runnerFactoryStub.restore();
    });

    describe("when running", () => {

        it("should run all the registered projections", () => {
            registry.add(new MockProjectionDefinition()).forArea("Admin");
            subject.run();
            expect(notifyStub.calledWith(runner, new PushContext("Admin", "Mock"))).to.be(true);
        });

        describe("and a projection fails", () => {
            it("should keep running all the remaining projections");
        });
    });
});
