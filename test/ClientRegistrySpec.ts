import "reflect-metadata";
import expect = require("expect.js");
import PushContext from "../scripts/push/PushContext";
import * as TypeMoq from "typemoq";
import IProjectionRegistry from "../scripts/registry/IProjectionRegistry";
import MockProjectionRegistry from "./fixtures/MockProjectionRegistry";
import RegistryEntry from "../scripts/registry/RegistryEntry";
import MockSocketClient from "./fixtures/web/MockSocketClient";
import {IClientRegistry, ISocketClient} from "../scripts/push/IPushComponents";
import ClientRegistry from "../scripts/push/ClientRegistry";

describe("ClientRegistry, given a client", () => {

    let subject: IClientRegistry;
    let client: TypeMoq.Mock<ISocketClient>;
    let registry: TypeMoq.Mock<IProjectionRegistry>;

    beforeEach(() => {
        client = TypeMoq.Mock.ofType(MockSocketClient);
        registry = TypeMoq.Mock.ofType(MockProjectionRegistry);
        subject = new ClientRegistry(registry.object);
    });

    context("when push notifications are needed for a viewmodel", () => {
        it("should register that client to the right notifications", () => {
            let context = new PushContext("Admin", "Foo");
            subject.add(client.object, context);
            client.verify(c => c.join("/admin/foo"), TypeMoq.Times.once());
        });

        context("and custom parameters are passed during the registration", () => {
            beforeEach(() => {
                registry.setup(r => r.getEntry("Foo", "Admin")).returns(() => {
                    return {area: "Admin", data: new RegistryEntry(null, null, (p) => p.id)};
                });
            });
            it("should subscribe that client using also those parameters", () => {
                let context = new PushContext("Admin", "Foo", {id: 25});
                subject.add(client.object, context);
                client.verify(c => c.join("/admin/foo/25"), TypeMoq.Times.once());
            });
        });

        context("when empty parameters are passed", () => {
           it("should register to that client with no parameters", () => {
               let context = new PushContext("Admin", "Foo", {});
               subject.add(client.object, context);
               client.verify(c => c.join("/admin/foo"), TypeMoq.Times.once());
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
            client.verify(c => c.leave("/admin/foo"), TypeMoq.Times.once());
        });
    });
});