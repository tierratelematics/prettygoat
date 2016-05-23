import expect = require('expect.js');
import sinon = require('sinon');

describe("PushClientHandler, given a client", () => {

    context("when push notifications are needed for a viewmodel", () => {
        it("should register that client to the right notifications");

        context("and custom parameters are passed during the registration", () => {
            it("should subscribe that client using also those parameters");
        });
    });

    context("when push notifications are no longer needed for a viewmodel", () => {
        it("should unregister that client from the notifications");
    });
});