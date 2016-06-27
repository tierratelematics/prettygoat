import "bluebird";
import "reflect-metadata";
import expect = require('expect.js');
import sinon = require('sinon');
import IPushNotifier from "../scripts/push/IPushNotifier";
import PushNotifier from "../scripts/push/PushNotifier";
import MockProjectionHandler from "./fixtures/MockProjectionHandler";
import PushContext from "../scripts/push/PushContext";
import IProjectionHandler from "../scripts/projections/IProjectionHandler";
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
import Event from "../scripts/streams/Event";
import IProjectionRegistry from "../scripts/registry/IProjectionRegistry";
import ProjectionRegistry from "../scripts/registry/ProjectionRegistry";
import IReadModelFactory from "../scripts/streams/IReadModelFactory";
import MockReadModelFactory from "./fixtures/MockReadModelFactory";
import RegistryEntry from "../scripts/registry/RegistryEntry";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";

describe("Given a push notifier", () => {

    let subject:IPushNotifier,
        projectionHandler:IProjectionHandler<MockModel>,
        router:IProjectionRouter,
        dataSubject:Subject<Event<MockModel>>,
        routerSpy:SinonSpy,
        clientRegistry:IClientRegistry,
        clientsStub:SinonStub,
        eventEmitter:IEventEmitter,
        emitterSpy:SinonSpy,
        registry:IProjectionRegistry,
        registryStub:SinonStub,
        readModelFactory:IReadModelFactory;

    beforeEach(() => {
        router = new MockProjectionRouter();
        dataSubject = new Subject<Event<MockModel>>();
        projectionHandler = new MockProjectionHandler(dataSubject);
        clientRegistry = new ClientRegistry();
        eventEmitter = new MockEventEmitter();
        registry = new ProjectionRegistry(null, null);
        readModelFactory = new MockReadModelFactory();
        routerSpy = sinon.spy(router, "get");
        clientsStub = sinon.stub(clientRegistry, "clientsFor", () => [new ClientEntry("2828s"), new ClientEntry("shh3", {id: "2-4u4-d"})]);
        emitterSpy = sinon.spy(eventEmitter, "emitTo");
        registryStub = sinon.stub(registry, "getEntry", () => {
            return {
                area: "Admin",
                data: new RegistryEntry(new MockProjectionDefinition().define(), "Foo")
            }
        });
        subject = new PushNotifier(router, eventEmitter, clientRegistry, {
            host: 'test',
            protocol: 'http',
            port: 80
        }, null, registry, readModelFactory);
    });

    afterEach(() => {
        routerSpy.restore();
        clientsStub.restore();
        emitterSpy.restore();
        registryStub.restore();
    });

    context("when a new state is triggered by the projection", () => {
        it("should emit a notification on the corresponding context", () => {
            let newModel = new MockModel();
            newModel.id = "test";
            newModel.name = "testName";
            readModelFactory.publish({payload: newModel, type: "Foo"});
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
                }, null, registry, readModelFactory);
                readModelFactory.publish({payload: new MockModel(), type: "Foo"});
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
                }, null, registry, readModelFactory);
                readModelFactory.publish({payload: new MockModel(), type: "Foo"});
                expect(emitterSpy.calledWith('2828s', 'Admin:Foo', {
                    url: 'http://test/projections/admin/foo/'
                })).to.be(true);
            });
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
});