import "bluebird";
import "reflect-metadata";
import expect = require("expect.js");
import PushContext from "../scripts/push/PushContext";
import ClientRegistry from "../scripts/push/ClientRegistry";
import IClientRegistry from "../scripts/push/IClientRegistry";

describe("ClientRegistry, given a client", () => {

    let subject:IClientRegistry,
        clientId = "288287sh";

    beforeEach(() => {
        subject = new ClientRegistry();
    });

    context("when push notifications are needed for a viewmodel", () => {
        it("should register that client to the right notifications", () => {
            let context = new PushContext("Admin", "Foo");
            subject.add(clientId, context);
            expect(subject.clientsFor(context)).to.have.length(1);
            expect(subject.clientsFor(context)[0]).to.eql({id: clientId, parameters: undefined});
        });

        context("and custom parameters are passed during the registration", () => {
            it("should subscribe that client using also those parameters", () => {
                let context = new PushContext("Admin", "Foo", {id: 25});
                subject.add(clientId, context);
                expect(subject.clientsFor(context)).to.have.length(1);
                expect(subject.clientsFor(context)[0]).to.eql({id: clientId, parameters: {id: 25}});
            });
        });

        context("but a client id is not provided", () => {
            it("should trigger an error", () => {
                let context = new PushContext("Admin", "Foo", {id: 25});
                expect(() => subject.add(null, context)).to.throwError();
            });
        });
    });

    context("when push notifications are no longer needed for a viewmodel", () => {
        it("should unregister that client from the notifications", () => {
            let context = new PushContext("Admin", "Foo", {id: 25});
            subject.add(clientId, context);
            subject.remove(clientId, context);
            expect(subject.clientsFor(context)).to.have.length(0);
        });
    });
});