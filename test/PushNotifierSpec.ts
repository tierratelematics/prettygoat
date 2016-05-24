import expect = require('expect.js');
import sinon = require('sinon');
import IPushNotifier from "../scripts/push/IPushNotifier";
import PushNotifier from "../scripts/push/PushNotifier";
import MockProjectionRunner from "./fixtures/MockProjectionRunner";
import PushContext from "../scripts/push/PushContext";
import IProjectionRunner from "../scripts/interfaces/IProjectionRunner";
import MockModel from "./fixtures/MockModel";
import IProjectionRouter from "../scripts/push/IProjectionRouter";
import MockProjectionRouter from "./fixtures/MockProjectionRouter";
import SinonSpy = Sinon.SinonSpy;
import {Subject} from "rx";
import IClientRegistry from "../scripts/push/IClientRegistry";
import SinonStub = Sinon.SinonStub;
import ClientRegistry from "../scripts/push/ClientRegistry";
import ClientEntry from "../scripts/push/ClientEntry";
import IEventEmitter from "../scripts/push/IEventEmitter";
import MockEventEmitter from "./fixtures/MockEventEmitter";

describe("PushNotifier, given a projection runner and a context", () => {

    let subject:IPushNotifier,
        projectionRunner:IProjectionRunner<MockModel>,
        router:IProjectionRouter,
        dataSubject:Subject<MockModel>,
        routerSpy:SinonSpy,
        clientRegistry:IClientRegistry,
        clientsStub:SinonStub,
        eventEmitter:IEventEmitter,
        emitterSpy:SinonSpy;

    beforeEach(() => {
        router = new MockProjectionRouter();
        dataSubject = new Subject<MockModel>();
        projectionRunner = new MockProjectionRunner(dataSubject);
        clientRegistry = new ClientRegistry();
        eventEmitter = new MockEventEmitter();
        subject = new PushNotifier(router, eventEmitter, clientRegistry);
        routerSpy = sinon.spy(router, "get");
        clientsStub = sinon.stub(clientRegistry, "clientsFor", () => [new ClientEntry("2828s"), new ClientEntry("shh3")]);
        emitterSpy = sinon.spy(eventEmitter, "emitTo");
    });

    afterEach(() => {
        routerSpy.restore();
        clientsStub.restore();
        emitterSpy.restore();
    });

    context("when they are registered together", () => {
        it("should create an endpoint to retrieve the latest model emitted by the projection", () => {
            subject.register(projectionRunner, new PushContext("Admin", "Foo"));
            expect(routerSpy.calledWith("/admin/foo")).to.be(true);
        });
    });

    context("when a new state is triggered by the projection", () => {
        it("should emit a notification on the corresponding context", () => {
            subject.register(projectionRunner, new PushContext("Admin", "Foo"));
            let newModel = new MockModel();
            newModel.id = "test";
            newModel.name = "testName";
            dataSubject.onNext(newModel);
            expect(emitterSpy.calledWith('2828s', 'Admin:Foo', {
                url: '/admin/foo'
            })).to.be(true);
            expect(emitterSpy.calledWith('shh3', 'Admin:Foo', {
                url: '/admin/foo'
            })).to.be(true);
        });
    });
});