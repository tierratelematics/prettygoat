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
import IProjectionRunnerFactory from "../scripts/projections/IProjectionRunnerFactory";
import ProjectionRunnerFactory from "../scripts/projections/ProjectionRunnerFactory";
import {ProjectionRunner} from "../scripts/projections/ProjectionRunner";
import {Matcher} from "../scripts/Matcher";
import IProjectionRunner from "../scripts/projections/IProjectionRunner";
import PushContext from "../scripts/push/PushContext";
import Constants from "../scripts/Constants";

describe("ProjectionRegistry, given a list of projection definitions", () => {

    let subject:IProjectionRegistry,
        pushNotifier:IPushNotifier,
        notifyStub:SinonStub,
        projectionRunnerFactory:IProjectionRunnerFactory,
        factoryStub:SinonStub,
        runner:IProjectionRunner<number>;

    beforeEach(() => {
        runner = new ProjectionRunner<number>("test", null, null, new Matcher({}));
        pushNotifier = new PushNotifier(null, null, null);
        projectionRunnerFactory = new ProjectionRunnerFactory();
        subject = new ProjectionRegistry(projectionRunnerFactory, pushNotifier);
        notifyStub = sinon.stub(pushNotifier, "register", () => {
        });
        factoryStub = sinon.stub(projectionRunnerFactory, "create", () => runner);
    });

    afterEach(() => {
        notifyStub.restore();
        factoryStub.restore();
    });

    context("when they are registered under a specific area", () => {
        it("should register the projection runners with the right contexts", () => {
            subject.add(new MockProjectionDefinition()).forArea("Admin");
            expect(notifyStub.calledWith(runner, new PushContext("Admin", "Mock"))).to.be(true);
        });
    });

    context("when a projection has no name", () => {
        it("should throw an error regarding the missing decorator", () => {
            expect(() => subject.add(new UnnamedProjectionDefinition())).to.throwError();
        });
    });

    context("when the projection corresponding to the index page has to be registered", () => {
        it("should be registered with a default area name", () => {
            subject.index(new MockProjectionDefinition());
            expect(notifyStub.calledWith(runner, new PushContext(Constants.INDEX_AREA, "Mock"))).to.be(true);
        });
    });

    context("when the projection corresponding to the master page has to be registered", () => {
        it("should be registered with a default area name", () => {
            subject.master(new MockProjectionDefinition());
            expect(notifyStub.calledWith(runner, new PushContext(Constants.MASTER_AREA, "Mock"))).to.be(true);
        });
    });
});