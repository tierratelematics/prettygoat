import expect = require("expect.js");
import sinon = require("sinon");
import IEventDispatcher from "../scripts/events/IEventDispatcher";
import EventDispatcher from "../scripts/events/EventDispatcher";

describe("Event dispatcher, given some registered projections", () => {

    let subject:IEventDispatcher;

    beforeEach(() => {
        subject = new EventDispatcher();
    });

    context("when a new event is received", () => {
        it("should dispatch the event to the matching projections");

        context("and needs to be handled on a split projection", () => {
            it("should create the child projection and dispatch the event to that projection");
        });
    });
});