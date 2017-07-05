import "reflect-metadata";
import expect = require("expect.js");
import BackpressurePublisher from "../scripts/common/BackpressurePublisher";
import {TestScheduler} from "rxjs";
import * as chai from "chai";
import {IProjectionRunner} from "../scripts/projections/IProjectionRunner";
import {Subject} from "rxjs/Subject";
import {ProjectionStats} from "../scripts/projections/ProjectionRunner";

describe("Given a backpressure publisher", () => {

    let scheduler: TestScheduler;

    beforeEach(() => {
        scheduler = new TestScheduler(chai.assert.deepEqual);
    });

    context("when some messages are scheduled in the past", () => {
        it("should process those items with a delay", () => {

        });
    });

    context("when some messages are scheduled in realtime", () => {
        it("should process those events after the past events", () => {

        });
    });

    context("when a message needs to be scheduled", () => {
        let runner: IProjectionRunner,
            historicalData: Subject<any>,
            realtimeData: Subject<any>,
            subject: BackpressurePublisher<any>;

        beforeEach(() => {
            runner = <IProjectionRunner>{};
            historicalData = new Subject();
            realtimeData = new Subject();
            subject = new BackpressurePublisher(runner, null, null, historicalData, realtimeData);
        });
        context("and the projection is still fetching historical events", () => {
            it("should schedule those events on the historical queue", () => {
                let notifications = [];
                runner.stats = new ProjectionStats();
                historicalData.subscribe(data => notifications.push(data));
                subject.publish("item1");

                expect(notifications).to.eql(["item1"]);
            });
        });

        context("and the projection is fetching realtime events", () => {
            it("should schedule those events on the realtime queue", () => {
                let completed = false;
                let notifications = [];
                runner.stats = new ProjectionStats();
                historicalData.subscribe(null, null, () => completed = true);
                realtimeData.subscribe(data => notifications.push(data));
                subject.publish("item1");
                runner.stats.realtime = true;
                subject.publish("item2");

                expect(notifications).to.eql(["item2"]);
                expect(completed).to.be(true);
            });
        });
    });
});
