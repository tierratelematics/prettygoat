import "reflect-metadata";
import expect = require('expect.js');
import * as TypeMoq from "typemoq";
import PushContext from "../../scripts/push/PushContext";
import {Subject} from "rx";
import MockEventEmitter from "../fixtures/web/MockEventEmitter";
import {Event} from "../../scripts/streams/Event";
import {IPushNotifier, IEventEmitter} from "../../scripts/push/IPushComponents";
import PushNotifier from "../../scripts/push/PushNotifier";

describe("Given a push notifier", () => {

    let subject: IPushNotifier,
        dataSubject: Subject<Event>,
        eventEmitter: TypeMoq.IMock<IEventEmitter>;

    beforeEach(() => {
        dataSubject = new Subject<Event>();
        eventEmitter = TypeMoq.Mock.ofType(MockEventEmitter);
        eventEmitter.setup(e => e.emitTo(TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(a => null);
        subject = new PushNotifier(eventEmitter.object, {
            host: 'test',
            protocol: 'http',
            port: 80
        });
    });

    context("when a normal projection emits a new state", () => {
        it("should emit a notification on the corresponding context", () => {
            subject.notify(new PushContext("Admin", "Foo"));
            eventEmitter.verify(e => e.broadcastTo("/admin/foo", "Admin:Foo", TypeMoq.It.isValue({
                url: 'http://test:80/projections/admin/foo'
            })), TypeMoq.Times.once());
        });

        context("and no port is passed in the config", () => {
            it("should not append the port in the notification url", () => {
                subject = new PushNotifier(eventEmitter.object, {
                    host: 'test',
                    protocol: 'http'
                });
                subject.notify(new PushContext("Admin", "Foo"));
                eventEmitter.verify(e => e.broadcastTo("/admin/foo", "Admin:Foo", TypeMoq.It.isValue({
                    url: 'http://test/projections/admin/foo'
                })), TypeMoq.Times.once());
            });
        });

        context("and a custom path is passed in the config", () => {
            it("should prepend this path to the endpoint", () => {
                subject = new PushNotifier(eventEmitter.object, {
                    host: 'test',
                    protocol: 'http',
                    path: '/proj'
                });
                subject.notify(new PushContext("Admin", "Foo"));
                eventEmitter.verify(e => e.broadcastTo("/admin/foo", "Admin:Foo", TypeMoq.It.isValue({
                    url: 'http://test/proj/admin/foo'
                })), TypeMoq.Times.once());
            });
        });

        context("and no custom path path is passed in the config", () => {
            it("should append a default projections path", () => {
                subject = new PushNotifier(eventEmitter.object, {
                    host: 'test',
                    protocol: 'http'
                });
                subject.notify(new PushContext("Admin", "Foo"));
                eventEmitter.verify(e => e.broadcastTo("/admin/foo", "Admin:Foo", TypeMoq.It.isValue({
                    url: 'http://test/projections/admin/foo'
                })), TypeMoq.Times.once());
            });
        });

        context("and the client has a custom config for notifications", () => {
            it("should use these settings to construct the notification url", () => {
                subject = new PushNotifier(eventEmitter.object, {
                    host: 'test',
                    port: 80,
                    protocol: 'http',
                    notifications: {
                        host: "test",
                        port: null,
                        protocol: 'https'
                    }
                });
                subject.notify(new PushContext("Admin", "Foo"));
                eventEmitter.verify(e => e.broadcastTo("/admin/foo", "Admin:Foo", TypeMoq.It.isValue({
                    url: 'https://test/projections/admin/foo'
                })), TypeMoq.Times.once());
            })
        });
    });

    context("when a split projection emits a new state", () => {
        it("should append the split key in the notification url", () => {
            subject.notify(new PushContext("Admin", "Foo"), null, "7564");
            eventEmitter.verify(e => e.broadcastTo("/admin/foo/7564", "Admin:Foo", TypeMoq.It.isValue({
                url: 'http://test:80/projections/admin/foo/7564'
            })), TypeMoq.Times.once());
        });
    });

    context("when a single client needs to be notified", () => {
        it("should send a notification only to that client", () => {
            subject.notify(new PushContext("Admin", "Foo"), "25f");
            eventEmitter.verify(e => e.emitTo('25f', 'Admin:Foo', TypeMoq.It.isValue({
                url: 'http://test:80/projections/admin/foo'
            })), TypeMoq.Times.once());
        });
    });
});