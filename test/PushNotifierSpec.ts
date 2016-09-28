import "bluebird";
import "reflect-metadata";
import expect = require('expect.js');
import sinon = require('sinon');
import IPushNotifier from "../scripts/push/IPushNotifier";
import PushNotifier from "../scripts/push/PushNotifier";
import PushContext from "../scripts/push/PushContext";
import MockModel from "./fixtures/MockModel";
import SinonSpy = Sinon.SinonSpy;
import {Subject} from "rx";
import IClientRegistry from "../scripts/push/IClientRegistry";
import SinonStub = Sinon.SinonStub;
import ClientRegistry from "../scripts/push/ClientRegistry";
import ClientEntry from "../scripts/push/ClientEntry";
import IEventEmitter from "../scripts/push/IEventEmitter";
import MockEventEmitter from "./fixtures/MockEventEmitter";
import {Event} from "../scripts/streams/Event";
import IProjectionRegistry from "../scripts/registry/IProjectionRegistry";
import ProjectionRegistry from "../scripts/registry/ProjectionRegistry";
import RegistryEntry from "../scripts/registry/RegistryEntry";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";
import IProjectionRunner from "../scripts/projections/IProjectionRunner";
import MockProjectionRunner from "./fixtures/MockProjectionRunner";

describe("Given a push notifier", () => {

    let subject:IPushNotifier,
        projectionRunner:IProjectionRunner<MockModel>,
        dataSubject:Subject<Event>,
        clientRegistry:IClientRegistry,
        clientsStub:SinonStub,
        eventEmitter:IEventEmitter,
        emitterSpy:SinonSpy,
        registry:IProjectionRegistry,
        registryStub:SinonStub;

    beforeEach(() => {
        dataSubject = new Subject<Event>();
        projectionRunner = new MockProjectionRunner(dataSubject);
        clientRegistry = new ClientRegistry();
        eventEmitter = new MockEventEmitter();
        registry = new ProjectionRegistry(null, null);
        clientsStub = sinon.stub(clientRegistry, "clientsFor", () => [
            new ClientEntry("2828s"), new ClientEntry("shh3", {id: "2-4u4-d"})
        ]);
        emitterSpy = sinon.spy(eventEmitter, "emitTo");
        registryStub = sinon.stub(registry, "getEntry", () => {
            return {
                area: "Admin",
                data: new RegistryEntry(new MockProjectionDefinition().define(), "Foo")
            }
        });
        subject = new PushNotifier(eventEmitter, clientRegistry, {
            host: 'test',
            protocol: 'http',
            port: 80
        }, registry);
    });

    afterEach(() => {
        clientsStub.restore();
        emitterSpy.restore();
        registryStub.restore();
    });

    context("when a new state is triggered by the projection", () => {
        it("should emit a notification on the corresponding context", () => {
            subject.notify(new PushContext("Admin", "Foo"));
            expect(emitterSpy.calledWith('2828s', 'Admin:Foo', {
                url: 'http://test:80/admin/foo/'
            })).to.be(true);
            expect(emitterSpy.calledWith('shh3', 'Admin:Foo', {
                url: 'http://test:80/admin/foo/'
            })).to.be(true);
        });

        context("and no port is passed in the config", () => {
            it("should not append the port in the notification url", () => {
                subject = new PushNotifier(eventEmitter, clientRegistry, {
                    host: 'test',
                    protocol: 'http'
                }, registry);
                subject.notify(new PushContext("Admin", "Foo"));
                expect(emitterSpy.calledWith('2828s', 'Admin:Foo', {
                    url: 'http://test/admin/foo/'
                })).to.be(true);
            });
        });

        context("and a custom path is passed in the config", () => {
            it("should prepend this path to the endpoint", () => {
                subject = new PushNotifier(eventEmitter, clientRegistry, {
                    host: 'test',
                    protocol: 'http',
                    path: '/projections'
                }, registry);
                subject.notify(new PushContext("Admin", "Foo"));
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