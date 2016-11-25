import "bluebird";
import "reflect-metadata";
import expect = require("expect.js");
import ReadModelFactory from "../scripts/streams/ReadModelFactory";
import {Event} from "../scripts/streams/Event";

describe("Given a Read Model Factory", () => {

    let subject: ReadModelFactory,
        notifications:Event[],
        event:Event,
        eventB:Event;

    beforeEach(() => {
        notifications = [];
        subject = new ReadModelFactory();
        event = {
            type: "EventTypeA",
            payload: null,
            timestamp: new Date(86400),
            splitKey: null
        };
        subject.publish({type: "EventTypeA", payload: null,timestamp: new Date(10),splitKey: null});
        subject.publish(event);
    });

    context("when subscribing to the stream",  () => {
        it("should push a distinct of all the generated readmodels", () => {
            subject.from(null).subscribe(event => notifications.push(event));
            expect(notifications).to.have.length(1);
            expect(notifications[0]).to.be.eql(event);
        });
    });

    context("after subscribing to the stream", () => {
        beforeEach(() => {
            eventB = {
                type: "EventTypeB",
                payload: null,
                timestamp: new Date(10),
                splitKey: null
            };
        });

        it("should push the newly generated readmodels", () => {
            subject.from(null).subscribe(event => notifications.push(event));
            subject.publish(eventB);
            expect(notifications).to.have.length(2);
            expect(notifications[0]).to.be.eql(event);
            expect(notifications[1]).to.be.eql(eventB);
        });
    });
});