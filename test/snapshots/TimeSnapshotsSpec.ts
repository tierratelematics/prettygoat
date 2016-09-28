import expect = require("expect.js");
import TimeSnapshotStrategy from "../../scripts/snapshots/TimeSnapshotStrategy";

describe("Given a time based snapshots strategy", () => {

    let subject:TimeSnapshotStrategy;

    beforeEach(() => {
        subject = new TimeSnapshotStrategy();
        subject.saveThreshold(5 * 60 * 1000);
    });

    context("when a new event is processed", () => {
        context("and the timestamp differs from the last timestamp by a certain delta", () => {
            it("should trigger a snapshot save", () => {
                expect(subject.needsSnapshot({
                    type: "test",
                    payload: null,
                    timestamp: "1467281712000",
                    splitKey: null
                })).to.be(false);
                expect(subject.needsSnapshot({
                    type: "test2",
                    payload: null,
                    timestamp: "1467282072000",
                    splitKey: null
                })).to.be(false);
                expect(subject.needsSnapshot({
                    type: "test",
                    payload: null,
                    timestamp: "1467282072000",
                    splitKey: null
                })).to.be(true);
            });
        });

        context("and the timestamp does not differ from the last timestamp by a certain delta", () => {
            it("should not trigger a snapshot save", () => {
                subject.needsSnapshot({
                    type: "test",
                    payload: null,
                    timestamp: "1467281712000",
                    splitKey: null
                });
                expect(subject.needsSnapshot({
                    type: "test",
                    payload: null,
                    timestamp: "1467281772000",
                    splitKey: null
                })).to.be(false);
            });
        });
    });
});
