import expect = require("expect.js");
import CountSnapshotStrategy from "../../scripts/snapshots/CountSnapshotStrategy";

describe("Given a count based snapshots strategy", () => {

    let subject: CountSnapshotStrategy;

    beforeEach(() => {
        subject = new CountSnapshotStrategy();
        subject.saveThreshold(3);
    });

    context("when a new event is processed", () => {
        context("and it exceeds the counter for the snapshot", () => {
            it("should trigger a snapshot save", () => {
                subject.needsSnapshot({
                    type: "test",
                    payload: null,
                    timestamp: null
                });
                subject.needsSnapshot({
                    type: "test",
                    payload: null,
                    timestamp: null
                });
                expect(subject.needsSnapshot({
                    type: "test2",
                    payload: null,
                    timestamp: null
                })).to.be(false);
                expect(subject.needsSnapshot({
                    type: "test",
                    payload: null, timestamp: null
                })).to.be(true);
            });
        });

        context("and it does not exceed the counter for the snapshot", () => {
            it("should not trigger a snapshot save", () => {
                subject.needsSnapshot({
                    type: "test",
                    payload: null,
                    timestamp: null
                });
                expect(subject.needsSnapshot({
                    type: "test",
                    payload: null,
                    timestamp: null
                })).to.be(false);
            });
        });
    });
});
