import expect = require("expect.js");
import EventsFilter from "../scripts/streams/EventsFilter";
import ReservedEvents from "../scripts/streams/ReservedEvents";

describe("EventsFilter, given a projection definition", () => {

    let eventsFilter: EventsFilter;

    beforeEach(() => {
        eventsFilter = new EventsFilter();
        eventsFilter.setEventsList(["TestEvent", "SecondEvent"]);
    });

    context("when the events needs to be retrieved", () => {
        it("should return the events matched by that projection", () => {
            expect(eventsFilter.filter({
                $init: () => null,
                TestEvent: (s, e) => e,
            })).to.eql(["TestEvent",
                ReservedEvents.TICK,
                ReservedEvents.REALTIME,
                ReservedEvents.FETCH_EVENTS]);
        });
        context("and the projection has an $any matcher", () => {
            it("should return all the events", () => {
                expect(eventsFilter.filter({
                    $init: () => null,
                    $any: (s, e) => e
                })).to.eql(["TestEvent", "SecondEvent",
                    ReservedEvents.TICK,
                    ReservedEvents.REALTIME,
                    ReservedEvents.FETCH_EVENTS]);
            });
        });

        context("and the projection has a wildcard matcher", () => {
            it("should return the events matched by the wildcard", () => {
                expect(eventsFilter.filter({
                    $init: () => null,
                    "Test*": (s, e) => e
                })).to.eql(["TestEvent",
                    ReservedEvents.TICK,
                    ReservedEvents.REALTIME,
                    ReservedEvents.FETCH_EVENTS]);
            });
        });

        context("and no events are matched", () => {
            it("should return all the events", () => {
                expect(eventsFilter.filter({
                    $init: () => null
                })).to.eql(["TestEvent", "SecondEvent",
                    ReservedEvents.TICK,
                    ReservedEvents.REALTIME,
                    ReservedEvents.FETCH_EVENTS]);
            });
        });
    });
});