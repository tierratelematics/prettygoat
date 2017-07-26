import "reflect-metadata";
import expect = require("expect.js");
import PushContext from "../scripts/push/PushContext";
import {IMock, Mock, Times} from "typemoq";
import {IClientRegistry, ISocketClient} from "../scripts/push/PushComponents";
import ClientRegistry from "../scripts/push/ClientRegistry";
import {IProjectionRegistry} from "../scripts/bootstrap/ProjectionRegistry";
import ClientRegistryDefinition from "./fixtures/definitions/ClientRegistryDefinition";

describe("ClientRegistry, given a client", () => {

    let subject: IClientRegistry;
    let client: IMock<ISocketClient>;
    let registry: IMock<IProjectionRegistry>;

    beforeEach(() => {
        client = Mock.ofType<ISocketClient>();
        registry = Mock.ofType<IProjectionRegistry>();
        subject = new ClientRegistry(registry.object);
        let projection = new ClientRegistryDefinition().define();
        registry.setup(r => r.projectionFor("Foo", "Admin")).returns(() => ["Admin", projection]);
        registry.setup(r => r.projectionFor("Bar", "Admin")).returns(() => ["Admin", projection]);
        registry.setup(r => r.projectionFor("KeyUndefined", "Admin")).returns(() => ["Admin", projection]);
    });

    context("when push notifications are requested", () => {
        it("should register that client to the right notifications", () => {
            let context = new PushContext("Admin", "Foo");
            subject.add(client.object, context);

            client.verify(c => c.join("/admin/foo"), Times.once());
        });

        context("and custom parameters are passed during the registration", () => {
            context("and there's a $key clause defined", () => {
                it("should subscribe that client using also those parameters", () => {
                    let context = new PushContext("Admin", "Bar", {id: 25});
                    let key = subject.add(client.object, context);

                    client.verify(c => c.join("/admin/bar/25"), Times.once());
                    expect(key).to.be("25");
                });
            });
            context("but there's no $key clause defined", () => {
                it("should subscribe to the channel without parameters", () => {
                    let context = new PushContext("Admin", "Foo", {id: 25});
                    subject.add(client.object, context);

                    client.verify(c => c.join("/admin/foo"), Times.once());
                });
            });
            context("but there's no notification block", () => {
                it("should subscribe to the channel without parameters", () => {
                    let context = new PushContext("Admin", "KeyUndefined", {id: 25});
                    let key = subject.add(client.object, context);

                    client.verify(c => c.join("/admin/keyundefined"), Times.once());
                    expect(key).not.to.be.ok();
                });
            });
        });

        context("when empty parameters are passed", () => {
            it("should register to that client with no parameters", () => {
                let context = new PushContext("Admin", "Foo", {});
                subject.add(client.object, context);

                client.verify(c => c.join("/admin/foo"), Times.once());
            });
        });
    });

    context("when push notifications are no longer needed for a viewmodel", () => {
        beforeEach(() => {
            let context = new PushContext("Admin", "Foo");
            subject.add(client.object, context);
            subject.remove(client.object, context);
        });
        it("should unregister that client from the notifications", () => {
            client.verify(c => c.leave("/admin/foo"), Times.once());
        });
    });
});