import "reflect-metadata";
import expect = require("expect.js");
import {SnapshotProducer} from "../../scripts/snapshots/SnapshotProducer";
import {Mock} from "typemoq";
import {IIdempotenceFilter} from "../../scripts/events/IdempotenceFilter";
import {Snapshot} from "../../scripts/snapshots/ISnapshotRepository";

describe("Given a snapshot producer", () => {

    let subject: SnapshotProducer;

    beforeEach(() => {
        let filter = Mock.ofType<IIdempotenceFilter>();
        filter.setup(f => f.serialize()).returns(() => [
            {id: "test", timestamp: new Date(2)}
        ]);

        subject = new SnapshotProducer({
            "Mock": filter.object
        });
    });

    context("when snapshotting a projection", () => {
        it("should produce the correct snapshot", () => {
            expect(subject.produce({
                type: "Mock", payload: {count: 10}, timestamp: new Date(20)
            })).to.eql(new Snapshot({ projectionState: {count: 10}}, new Date(20), [{id: "test", timestamp: new Date(2)}]));
        });
    });
});
