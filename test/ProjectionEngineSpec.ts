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
import IProjectionRunner from "../scripts/projections/IProjectionRunner";
import IPushNotifier from "../scripts/push/IPushNotifier";
import {ProjectionAnalyzer} from "../scripts/projections/ProjectionAnalyzer";
import {Subject} from "rx";
import IProjectionRunnerFactory from "../scripts/projections/IProjectionRunnerFactory";
import MockProjectionRunner from "./fixtures/MockProjectionRunner";
import MockModel from "./fixtures/MockModel";
import SinonSpy = Sinon.SinonSpy;
import MockObjectContainer from "./fixtures/MockObjectContainer";
import MockStatePublisher from "./fixtures/MockStatePublisher";
import Event from "../scripts/streams/Event";

describe("Given a ProjectionEngine", () => {

    let subject:IProjectionEngine,
        registry:IProjectionRegistry,
        runnerFactory:IProjectionRunnerFactory,
        runnerFactoryStub:SinonStub,
        pushNotifier:IPushNotifier,
        runner:IProjectionRunner<MockModel>,
        runnerSpy:SinonSpy;

    beforeEach(() => {
        runner = new MockProjectionRunner(new Subject<Event>());
        pushNotifier = new PushNotifier(null, null, {host: 'test', protocol: 'http', port: 80}, null);
        runnerFactory = new ProjectionRunnerFactory(null, null);
        registry = new ProjectionRegistry(new ProjectionAnalyzer(), new MockObjectContainer());
        subject = new ProjectionEngine(runnerFactory, pushNotifier, registry, new MockStatePublisher());
        runnerFactoryStub = sinon.stub(runnerFactory, "create", () => runner);
        runnerSpy = sinon.stub(runner, "run");
    });

    afterEach(() => {
        runnerFactoryStub.restore();
        runnerSpy.restore();
    });

    describe("when running", () => {

        it("should run all the registered projections", () => {
            registry.add(MockProjectionDefinition).forArea("Admin");
            subject.run();
            expect(runnerSpy.called).to.be(true);
        });
    });
});
