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
import PushContext from "../scripts/push/PushContext";
import IProjectionRunnerFactory from "../scripts/projections/IProjectionRunnerFactory";
import MockProjectionRunner from "./fixtures/MockProjectionRunner";
import MockModel from "./fixtures/MockModel";
import SinonSpy = Sinon.SinonSpy;
import MockObjectContainer from "./fixtures/MockObjectContainer";

describe("Given a ProjectionEngine", () => {

    let subject:IProjectionEngine,
        registry:IProjectionRegistry,
        runnerFactory:IProjectionRunnerFactory,
        runnerFactoryStub:SinonStub,
        pushNotifier:IPushNotifier,
        notifyStub:SinonStub,
        runner:IProjectionRunner<MockModel>,
        runnerSpy:SinonSpy;

    beforeEach(() => {
        runner = new MockProjectionRunner(null);
        pushNotifier = new PushNotifier(null, null, null, {host: 'test', protocol: 'http', port: 80});
        runnerFactory = new ProjectionRunnerFactory(null, null, null);
        registry = new ProjectionRegistry(new ProjectionAnalyzer(), new MockObjectContainer());
        subject = new ProjectionEngine(runnerFactory, pushNotifier, registry);
        notifyStub = sinon.stub(pushNotifier, "register", () => {
        });
        runnerFactoryStub = sinon.stub(runnerFactory, "create", () => runner);
        runnerSpy = sinon.stub(runner, "run");
    });

    afterEach(() => {
        notifyStub.restore();
        runnerFactoryStub.restore();
        runnerSpy.restore();
    });

    describe("when running", () => {

        it("should run all the registered projections", () => {
            registry.add(MockProjectionDefinition).forArea("Admin");
            subject.run();
            expect(notifyStub.calledWith(runner, new PushContext("Admin", "Mock"))).to.be(true);
            expect(runnerSpy.called).to.be(true);
        });
    });
});
