import "bluebird";
import "reflect-metadata";
import expect = require('expect.js');
import * as TypeMoq from "typemoq";
import IPushNotifier from "../scripts/push/IPushNotifier";
import PushNotifier from "../scripts/push/PushNotifier";
import PushContext from "../scripts/push/PushContext";
import {Subject} from "rx";
import IClientRegistry from "../scripts/push/IClientRegistry";
import ClientRegistry from "../scripts/push/ClientRegistry";
import ClientEntry from "../scripts/push/ClientEntry";
import IEventEmitter from "../scripts/push/IEventEmitter";
import MockEventEmitter from "./fixtures/web/MockEventEmitter";
import {Event} from "../scripts/streams/Event";
import IProjectionRegistry from "../scripts/registry/IProjectionRegistry";
import RegistryEntry from "../scripts/registry/RegistryEntry";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";
import MockProjectionRegistry from "./fixtures/MockProjectionRegistry";
import e = require("express");

describe("Given a push notifier", () => {

    let subject:IPushNotifier,
        dataSubject:Subject<Event>,
        clientRegistry:TypeMoq.Mock<IClientRegistry>,
        eventEmitter:TypeMoq.Mock<IEventEmitter>,
        registry:TypeMoq.Mock<IProjectionRegistry>;

    beforeEach(() => {
        dataSubject = new Subject<Event>();
        clientRegistry = TypeMoq.Mock.ofType(ClientRegistry);
        eventEmitter = TypeMoq.Mock.ofType(MockEventEmitter);
        registry = TypeMoq.Mock.ofType(MockProjectionRegistry);
        clientRegistry.setup(c => c.clientsFor(TypeMoq.It.isAny())).returns(a => [
            new ClientEntry("2828s"), new ClientEntry("shh3", {id: "2-4u4-d"})
        ]);
        eventEmitter.setup(e => e.emitTo(TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(a => null);
        registry.setup(r => r.getEntry(TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(a => {
            return {
                area: "Admin",
                data: new RegistryEntry(new MockProjectionDefinition().define(), "Foo")
            }
        });
        subject = new PushNotifier(eventEmitter.object, clientRegistry.object, {
            host: 'test',
            protocol: 'http',
            port: 80
        }, registry.object);
    });

    context("when a new state is triggered by the projection", () => {
        it("should emit a notification on the corresponding context", () => {
            subject.notify(new PushContext("Admin", "Foo"));
            eventEmitter.verify(e => e.emitTo('2828s', 'Admin:Foo', TypeMoq.It.isValue({
                url: 'http://test:80/admin/foo/'
            })), TypeMoq.Times.once());
            eventEmitter.verify(e => e.emitTo('shh3', 'Admin:Foo', TypeMoq.It.isValue({
                url: 'http://test:80/admin/foo/'
            })), TypeMoq.Times.once());
        });

        context("and no port is passed in the config", () => {
            it("should not append the port in the notification url", () => {
                subject = new PushNotifier(eventEmitter.object, clientRegistry.object, {
                    host: 'test',
                    protocol: 'http'
                }, registry.object);
                subject.notify(new PushContext("Admin", "Foo"));
                eventEmitter.verify(e => e.emitTo('2828s', 'Admin:Foo', TypeMoq.It.isValue({
                    url: 'http://test/admin/foo/'
                })), TypeMoq.Times.once());
            });
        });

        context("and a custom path is passed in the config", () => {
            it("should prepend this path to the endpoint", () => {
                subject = new PushNotifier(eventEmitter.object, clientRegistry.object, {
                    host: 'test',
                    protocol: 'http',
                    path: '/projections'
                }, registry.object);
                subject.notify(new PushContext("Admin", "Foo"));
                eventEmitter.verify(e => e.emitTo('2828s', 'Admin:Foo', TypeMoq.It.isValue({
                    url: 'http://test/projections/admin/foo/'
                })), TypeMoq.Times.once());
            });
        });

        context("and the client has a custom config for notifications", () => {
            it("should use these settings to construct the notification url", () => {
                subject = new PushNotifier(eventEmitter.object, clientRegistry.object, {
                    host: 'test',
                    port: 80,
                    protocol: 'http',
                    notifications: {
                        host: "test",
                        port: null,
                        protocol: 'https'
                    }
                }, registry.object);
                subject.notify(new PushContext("Admin", "Foo"));
                eventEmitter.verify(e => e.emitTo('2828s', 'Admin:Foo', TypeMoq.It.isValue({
                    url: 'https://test/admin/foo/'
                })), TypeMoq.Times.once());
            })
        });
    });

    context("when a single client needs to be notified", () => {
        it("should not broadcast to the other clients", () => {
            subject.notify(new PushContext("Admin", "Foo"), "25f");
            eventEmitter.verify(e => e.emitTo('25f', 'Admin:Foo', TypeMoq.It.isValue({
                url: 'http://test:80/admin/foo/'
            })), TypeMoq.Times.once());
            eventEmitter.verify(e => e.emitTo('2828s', 'Admin:Foo', TypeMoq.It.isValue({
                url: 'http://test:80/admin/foo/'
            })), TypeMoq.Times.never());
        });
    });
});