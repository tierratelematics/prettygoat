import "reflect-metadata";
import expect = require("expect.js");
import {Mock, IMock, Times, It} from "typemoq";
import PushContext from "../../scripts/push/PushContext";
import {Subject} from "rxjs";
import {Event} from "../../scripts/events/Event";
import {IPushNotifier, IEventEmitter} from "../../scripts/push/PushComponents";
import PushNotifier from "../../scripts/push/PushNotifier";

describe("Given a push notifier", () => {

    let subject: IPushNotifier,
        dataSubject: Subject<Event>,
        eventEmitter: IMock<IEventEmitter>;

    beforeEach(() => {
        dataSubject = new Subject<Event>();
        eventEmitter = Mock.ofType<IEventEmitter>();
        eventEmitter.setup(e => e.emitTo(It.isAny(), It.isAny(), It.isAny())).returns(a => null);
        subject = new PushNotifier(eventEmitter.object, {
            port: 80
        }, {
            host: "test",
            protocol: "http",
        });
    });

    context("when a projection emits a new state", () => {
        it("should emit a notification on the corresponding context", () => {
            subject.notify(new PushContext("Admin", "Foo"));
            eventEmitter.verify(e => e.broadcastTo("/admin/foo", "Admin:Foo", It.isValue({
                url: "http://test:80/projections/admin/foo",
                notificationKey: null
            })), Times.once());
        });

        context("and no port is passed in the config", () => {
            it("should not append the port in the notification url", () => {
                subject = new PushNotifier(eventEmitter.object, null, {
                    host: "test",
                    protocol: "http"
                });
                subject.notify(new PushContext("Admin", "Foo"));
                eventEmitter.verify(e => e.broadcastTo("/admin/foo", "Admin:Foo", It.isValue({
                    url: "http://test/projections/admin/foo",
                    notificationKey: null
                })), Times.once());
            });
        });

        context("and a custom path is passed in the config", () => {
            it("should prepend this path to the endpoint", () => {
                subject = new PushNotifier(eventEmitter.object, null, {
                    host: "test",
                    protocol: "http",
                    path: "/proj",
                    port: null
                });
                subject.notify(new PushContext("Admin", "Foo"));
                eventEmitter.verify(e => e.broadcastTo("/admin/foo", "Admin:Foo", It.isValue({
                    url: "http://test/proj/admin/foo",
                    notificationKey: null
                })), Times.once());
            });
        });

        context("and no custom path path is passed in the config", () => {
            it("should append a default projections path", () => {
                subject = new PushNotifier(eventEmitter.object, null, {
                    host: "test",
                    protocol: "http",
                    port: null
                });
                subject.notify(new PushContext("Admin", "Foo"));
                eventEmitter.verify(e => e.broadcastTo("/admin/foo", "Admin:Foo", It.isValue({
                    url: "http://test/projections/admin/foo",
                    notificationKey: null
                })), Times.once());
            });
        });

        context("and a custom port is used for notifications", () => {
            it("should use these settings to construct the notification url", () => {
                subject = new PushNotifier(eventEmitter.object, {
                    port: 80
                }, {
                    host: "test",
                    port: null,
                    protocol: "https"
                });
                subject.notify(new PushContext("Admin", "Foo"));
                eventEmitter.verify(e => e.broadcastTo("/admin/foo", "Admin:Foo", It.isValue({
                    url: "https://test/projections/admin/foo",
                    notificationKey: null
                })), Times.once());
            });
        });
        context("and a specific group of clients needs to be notified", () => {
            it("should populate the notification key", () => {
                subject.notify(new PushContext("Admin", "Foo"), "7564");
                eventEmitter.verify(e => e.broadcastTo("/admin/foo/7564", "Admin:Foo", It.isValue({
                    url: "http://test:80/projections/admin/foo",
                    notificationKey: "7564"
                })), Times.once());
            });
        });
    });

    context("when a single client needs to be notified", () => {
        it("should send a notification only to that client", () => {
            subject.notify(new PushContext("Admin", "Foo"), null, "25f");
            eventEmitter.verify(e => e.emitTo("25f", "Admin:Foo", It.isValue({
                url: "http://test:80/projections/admin/foo",
                notificationKey: null
            })), Times.once());
        });
    });
});