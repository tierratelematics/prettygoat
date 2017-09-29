import "reflect-metadata";
import expect = require("expect.js");
import {IdempotenceFilter} from "../scripts/events/IdempotenceFilter";

describe("Given an idempotence filter", () => {

    let subject: IdempotenceFilter;

    context("when an event has been already processed", () => {
        beforeEach(() => {
            subject = new IdempotenceFilter([
                {id: "event1", timestamp: null},
                {id: "event2", timestamp: null}
            ]);
        });

        it("should not be processed", () => {
            expect(subject.filter({
                id: "event1", payload: null, timestamp: null, type: null
            })).to.be(false);
        });
    });

    context("when an event has not been processed yet", () => {
        beforeEach(() => {
            subject = new IdempotenceFilter([
                {id: "event1", timestamp: null}
            ]);
        });
        it("should be processed", () => {
            expect(subject.filter({
                id: "event3", payload: null, timestamp: null, type: null
            })).to.be(true);
        });

        it("should be queued", () => {
            expect(subject.filter({
                id: "event3", payload: null, timestamp: null, type: null
            })).to.be(true);
            expect(subject.filter({
                id: "event3", payload: null, timestamp: null, type: null
            })).to.be(false);
        });
    });
});
