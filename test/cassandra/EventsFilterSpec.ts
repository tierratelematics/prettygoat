import "reflect-metadata";
import expect = require("expect.js");
import EventsFilter from "../../scripts/cassandra/EventsFilter";

describe("EventsFilter, given a projection definition", () => {

    let eventsFilter: EventsFilter;

    beforeEach(() => {
        eventsFilter = new EventsFilter();
        eventsFilter.setEventsList(["TestEvent", "SecondEvent"]);
    });

    context("when the events need to be retrieved", () => {
        it("should return the events matched by that projection", () => {
            expect(eventsFilter.filter({
                $init: () => null,
                TestEvent: (s, e) => e,
            })).to.eql(["TestEvent"]);
        });
        context("and the projection has an $any matcher", () => {
            it("should return all the events", () => {
                expect(eventsFilter.filter({
                    $init: () => null,
                    $any: (s, e) => e
                })).to.eql(["TestEvent", "SecondEvent"]);
            });
        });

        context("and the projection has a wildcard matcher", () => {
            it("should return the events matched by the wildcard", () => {
                expect(eventsFilter.filter({
                    $init: () => null,
                    "Test*": (s, e) => e
                })).to.eql(["TestEvent"]);
            });
        });
    });
});