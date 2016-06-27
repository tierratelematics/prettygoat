import "bluebird";
import "reflect-metadata";
import expect = require('expect.js');
import sinon = require('sinon');
import IPushNotifier from "../scripts/push/IPushNotifier";
import PushNotifier from "../scripts/push/PushNotifier";
import MockProjectionRunner from "./fixtures/MockProjectionRunner";
import PushContext from "../scripts/push/PushContext";
import IProjectionRunner from "../scripts/projections/IProjectionRunner";
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
import Constants from "../scripts/registry/Constants";
import Event from "../scripts/streams/Event";

describe("PushNotifier, given a projection runner and a context", () => {

    let subject:IPushNotifier,
        projectionRunner:IProjectionRunner<MockModel>,
        router:IProjectionRouter,
        dataSubject:Subject<Event<MockModel>>,
        routerSpy:SinonSpy,
        clientRegistry:IClientRegistry,
        clientsStub:SinonStub,
        eventEmitter:IEventEmitter,
        emitterSpy:SinonSpy;

    beforeEach(() => {
        router = new MockProjectionRouter();
        dataSubject = new Subject<Event<MockModel>>();
        projectionRunner = new MockProjectionRunner(dataSubject);
        clientRegistry = new ClientRegistry();
        eventEmitter = new MockEventEmitter();
        subject = new PushNotifier(router, eventEmitter, clientRegistry, {
            host: 'test',
            protocol: 'http',
            port: 80
        }, null, null);
        routerSpy = sinon.spy(router, "get");
        clientsStub = sinon.stub(clientRegistry, "clientsFor", () => [new ClientEntry("2828s"), new ClientEntry("shh3", {id: "2-4u4-d"})]);
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
            dataSubject.onNext({splitKey: null, state: newModel});
            expect(emitterSpy.calledWith('2828s', 'Admin:Foo', {
                url: 'http://test:80/admin/foo/'
            })).to.be(true);
            expect(emitterSpy.calledWith('shh3', 'Admin:Foo', {
                url: 'http://test:80/admin/foo/'
            })).to.be(true);
        });

        context("and no port is passed in the config", () => {
            it("should not append the port in the notification url", () => {
                subject = new PushNotifier(router, eventEmitter, clientRegistry, {
                    host: 'test',
                    protocol: 'http'
                }, null);
                subject.register(projectionRunner, new PushContext("Admin", "Foo"));
                dataSubject.onNext({splitKey: null, state: new MockModel()});
                expect(emitterSpy.calledWith('2828s', 'Admin:Foo', {
                    url: 'http://test/admin/foo/'
                })).to.be(true);
            });
        });

        context("and a custom path is passed in the config", () => {
            it("should prepend this path to the endpoint", () => {
                subject = new PushNotifier(router, eventEmitter, clientRegistry, {
                    host: 'test',
                    protocol: 'http',
                    path: '/projections'
                }, null);
                subject.register(projectionRunner, new PushContext("Admin", "Foo"));
                dataSubject.onNext({splitKey: null, state: new MockModel()});
                expect(emitterSpy.calledWith('2828s', 'Admin:Foo', {
                    url: 'http://test/projections/admin/foo/'
                })).to.be(true);
            });
        });
    });

    context("when they are registered under the master context", () => {
        it("should use a default endpoint", () => {
            subject.register(projectionRunner, new PushContext(Constants.MASTER_AREA));
            expect(routerSpy.calledWith("/master")).to.be(true);
        });
    });

    context("when they are registered under the index context", () => {
        it("should use a default endpoint", () => {
            subject.register(projectionRunner, new PushContext(Constants.INDEX_AREA));
            expect(routerSpy.calledWith("/index")).to.be(true);
        });
    });

    context("when a single client needs to be notified", () => {
        it("should not broadcast to the other clients", () => {
            subject.notify(new PushContext("Admin", "Foo"), "25f");
            expect(emitterSpy.calledOnce);
            expect(emitterSpy.calledWith('25f', 'Admin:Foo', {
                url: 'http://test:80/admin/foo/'
            })).to.be(true);
        });
    });

    context("when the projection contains a parameters key", () => {
        it("should register the viewmodel under the endpoint /area/viewmodelId/splitKey", () => {
            subject.register(projectionRunner, new PushContext("Admin", "Foo"), p => null);
            expect(routerSpy.calledWith("/admin/foo/:key")).to.be(true);
        });
    });
});