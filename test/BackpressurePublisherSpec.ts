import "reflect-metadata";
import expect = require("expect.js");
import BackpressurePublisher from "../scripts/common/BackpressurePublisher";
import {TestScheduler} from "rxjs";
import * as chai from "chai";
import {IProjectionRunner} from "../scripts/projections/IProjectionRunner";
import {Subject} from "rxjs/Subject";
import {ProjectionStats} from "../scripts/projections/ProjectionRunner";
import {observable} from "rxjs/symbol/observable";

describe("Given a backpressure publisher", () => {

    let scheduler: TestScheduler;

    beforeEach(() => {
        scheduler = new TestScheduler(chai.assert.deepEqual);
    });

    context("when some messages are scheduled in the past", () => {
        let subject: BackpressurePublisher<any>;

        beforeEach(() => {
            subject = new BackpressurePublisher(null, {
                replay: 50,
                realtime: 20
            }, scheduler, scheduler.createHotObservable("(ab)", {
                a: "item1",
                b: "item2"
            }), scheduler.createHotObservable("|"));
        });
        it("should process those items with a delay", () => {
            scheduler.expectObservable(subject.items()).toBe("-----b", {b: "item2"});

            scheduler.flush();
        });
    });

    context("when some messages are scheduled in realtime", () => {
        let subject: BackpressurePublisher<any>;

        beforeEach(() => {
            subject = new BackpressurePublisher(null, {
                replay: 50,
                realtime: 30
            }, scheduler, scheduler.createHotObservable("--(ab|)", {
                a: "item1",
                b: "item2"
            }), scheduler.createHotObservable("------c", {c: "item3"}));
        });
        it("should process those events after the past events", () => {
            scheduler.expectObservable(subject.items()).toBe("--b-----c", {b: "item2", c: "item3"});

            scheduler.flush();
        });
    });

    context("when some messages are grouped", () => {
        let subject: BackpressurePublisher<any>;

        beforeEach(() => {
            subject = new BackpressurePublisher(null, {
                replay: 50,
                realtime: 20
            }, scheduler, scheduler.createHotObservable("(abcd)", {
                a: "item1",
                b: "item2",
                c: "item1",
                d: "item2"
            }), scheduler.createHotObservable("|"));
        });
        it("should process those items respecting the grouping", () => {
            scheduler.expectObservable(subject.items(item => item)).toBe("-----(cd)", {
                c: "item1",
                d: "item2"
            });

            scheduler.flush();
        });
    });

    context("when a message needs to be scheduled", () => {
        let runner: IProjectionRunner,
            historicalData: Subject<any>,
            realtimeData: Subject<any>,
            subject: BackpressurePublisher<any>;

        beforeEach(() => {
            runner = <IProjectionRunner>{stats: new ProjectionStats()};
            historicalData = new Subject();
            realtimeData = new Subject();
            subject = new BackpressurePublisher(runner, null, null, historicalData, realtimeData);
        });
        context("and the projection is still fetching historical events", () => {
            it("should schedule those events on the historical queue", () => {
                let notifications = [];
                historicalData.subscribe(data => notifications.push(data));
                subject.publish("item1");

                expect(notifications).to.eql(["item1"]);
            });
        });

        context("and the projection is fetching realtime events", () => {
            it("should schedule those events on the realtime queue", () => {
                let completed = false;
                let notifications = [];
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
