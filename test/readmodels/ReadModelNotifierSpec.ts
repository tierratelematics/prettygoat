import "reflect-metadata";
import expect = require("expect.js");
import {IReadModelNotifier, ReadModelNotifier, ReadModelNotification} from "../../scripts/readmodels/ReadModelNotifier";
import SpecialEvents from "../../scripts/events/SpecialEvents";
import { Observable, Subscription } from "rxjs";

describe("Given a readmodel notifier", () => {
    let subject: IReadModelNotifier;
    let notifications: ReadModelNotification[];
    let subscription: Subscription;

    beforeEach(() => {
        notifications = [];
        subject = new ReadModelNotifier();
        subscription = subject.changes("readmodel1").subscribe(event => notifications.push(event));
    });

    afterEach(() => subscription.unsubscribe());

    context("when a readmodel is published", () => {
        it("should notify those changes", async () => {
            subject.notifyChanged({
                type: "readmodel1",
                payload: "projection_state",
                timestamp: new Date(5000),
                id: "test",
                metadata: {}
            }, ["notification-key"]);
            await sleep(100);

            expect(notifications).to.have.length(1);
            expect(notifications[0]).to.eql([
                {
                    type: SpecialEvents.READMODEL_CHANGED,
                    payload: "readmodel1",
                    timestamp: new Date(5000),
                    id: "test",
                    metadata: {}
                },
                ["notification-key"]
            ]);
        });
    });

    async function sleep(ms: number) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(), ms);
        });
    }
});
