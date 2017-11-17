import "reflect-metadata";
import expect = require("expect.js");
import {SnapshotProducer} from "../../scripts/snapshots/SnapshotProducer";
import {Mock, IMock, Times, It} from "typemoq";
import {IIdempotenceFilter} from "../../scripts/events/IdempotenceFilter";
import {Snapshot} from "../../scripts/snapshots/ISnapshotRepository";
import { IMementoProducer } from "../../scripts/snapshots/MementoProducer";

describe("Given a snapshot producer", () => {

    let subject: SnapshotProducer;
    let mementoProducer: IMock<IMementoProducer<any>>;
    let event = {
        type: "Mock", payload: {count: 10}, timestamp: new Date(20)
    };

    beforeEach(() => {
        let filter = Mock.ofType<IIdempotenceFilter>();
        filter.setup(f => f.serialize()).returns(() => [
            {id: "test", timestamp: new Date(2)}
        ]);
        mementoProducer = Mock.ofType<IMementoProducer<any>>();
        subject = new SnapshotProducer({
            "Mock": filter.object
        }, mementoProducer.object);
    });

    context("when snapshotting a projection", () => {
        beforeEach(() => {
            mementoProducer.setup(m => m.produce(It.isValue(event))).returns(() => ({
                projectionState: { count: 10}
            }));
        });
        it("should produce the correct snapshot", () => {
            expect(subject.produce(event)).to.eql(new Snapshot({ projectionState: {count: 10}}, new Date(20), [{id: "test", timestamp: new Date(2)}]));
        });
    });
});
