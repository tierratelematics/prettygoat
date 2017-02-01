import expect = require("expect.js");
import TimePartitioner from "../scripts/cassandra/TimePartitioner";
import MockDateRetriever from "./fixtures/MockDateRetriever";

describe("TimePartitioner, given a date", () => {

    let subject:TimePartitioner;

    beforeEach(() => subject = new TimePartitioner(new MockDateRetriever(new Date("2016-06-04T08:49:22.209Z"))));

    context("when the list of the time buckets from now is needed", () => {
        it("should build it", () => {
            expect(subject.bucketsFrom(new Date("2016-06-01T08:48:22.206Z"))).to.eql(["20160601", "20160602", "20160603", "20160604"]);
        });

        context("and there are less than 24 hours between the date and now", () => {
            it("should consider only the day", () => {
                expect(subject.bucketsFrom(new Date("2016-06-03T21:48:22.206Z"))).to.eql(["20160603", "20160604"]);
            });
        });
    });
});