import expect = require("expect.js");
import sinon = require("sinon");
import EventsFilter from "../scripts/streams/EventsFilter";

describe("EventsFilter, given a projection definition", () => {

    let eventsFilter:EventsFilter;

    beforeEach(() => {
        eventsFilter = new EventsFilter();
    });

    context("when the events needs to be retrieved", () => {
        it("should return the events matched by that projection", () => {
            expect(eventsFilter.filter({
                $init: () => null,
                TestEvent: (s, e) => e,
                SecondEvent: (s, e) => e
            })).to.eql(["TestEvent", "SecondEvent"]);
        });
        context("but the projection has an $any matcher", () => {
            it("should return all the events", () => {
                expect(eventsFilter.filter({
                    $init: () => null,
                    $any: (s, e) => e
                })).to.eql([]);
            });
        });
    });
});