import "reflect-metadata";
import expect = require("expect.js");
import {IReadModelNotifier, ReadModelNotifier} from "../../scripts/readmodels/ReadModelNotifier";
import SpecialEvents from "../../scripts/events/SpecialEvents";

describe("Given a readmodel notifier", () => {
    let subject: IReadModelNotifier;

    beforeEach(() => {
        subject = new ReadModelNotifier();
    });

    context("when a readmodel is published", () => {
        it("should notify those changes", (done) => {
            subject.changes("readmodel1").take(1).subscribe(notification => {
                expect(notification).to.eql({
                    type: SpecialEvents.READMODEL_CHANGED,
                    payload: "readmodel1",
                    timestamp: new Date(6000),
                    id: undefined
                });
                done();
            });

            subject.notifyChanged("readmodel1", new Date(5000));
            subject.notifyChanged("readmodel2", new Date(5000));
            subject.notifyChanged("readmodel1", new Date(6000));
        });

        it("should append the event id", (done) => {
            subject.changes("readmodel1").take(1).subscribe(notification => {
                expect(notification).to.eql({
                    type: SpecialEvents.READMODEL_CHANGED,
                    payload: "readmodel1",
                    timestamp: new Date(5000),
                    id: "uniq-id-1"
                });
                done();
            });

            subject.notifyChanged("readmodel1", new Date(5000), "uniq-id-1");
        });
    });
});
