import expect = require("expect.js");
import sinon = require("sinon");
import * as TypeMoq from "typemoq";
import {Observable, Scheduler, ReplaySubject, IDisposable, Subject} from "rx";
import {IProjection} from "../scripts/projections/IProjection";
import TickProjectionDefinition from "./fixtures/definitions/TickProjectionDefinition";
import ITickScheduler from "../scripts/ticks/ITickScheduler";
import TickScheduler from "../scripts/ticks/TickScheduler";
import {Event} from "../scripts/streams/Event";
import {ProjectionRunner} from "../scripts/projections/ProjectionRunner";
import {MockStreamFactory} from "./fixtures/MockStreamFactory";
import {Matcher} from "../scripts/matcher/Matcher";
import MockReadModelFactory from "./fixtures/MockReadModelFactory";
import Tick from "../scripts/ticks/Tick";
import ReservedEvents from "../scripts/streams/ReservedEvents";
import SplitProjectionRunner from "../scripts/projections/SplitProjectionRunner";
import IProjectionRunner from "../scripts/projections/IProjectionRunner";
import MockDateRetriever from "./fixtures/MockDateRetriever";
import InitTickProjectionDefinition from "./fixtures/definitions/InitTickProjectionDefinition";

describe("TimeTick, given a tick scheduler and a projection", () => {

    let projection:IProjection<Tick>;
    let tickScheduler:ITickScheduler;
    let streamData:Subject<Event>;
    let notifications:Tick[];
    let dateRetriever:MockDateRetriever;

    beforeEach(() => {
        notifications = [];
        dateRetriever = new MockDateRetriever(new Date(3000));
        tickScheduler = new TickScheduler(new MockDateRetriever(new Date(0)));
        projection = new TickProjectionDefinition().define(tickScheduler);
        streamData = new Subject<Event>();
    });

    context("when the projection starts", () => {
        context("and a tick is emitted in $init", () => {
            beforeEach(() => {
                let initTickProjection = new InitTickProjectionDefinition().define(tickScheduler);
                let projectionRunner = new ProjectionRunner(projection, new MockStreamFactory(streamData), new Matcher(initTickProjection.definition),
                    new MockReadModelFactory(), tickScheduler, dateRetriever);
                projectionRunner.notifications().subscribe(event => notifications.push(event.payload));
                projectionRunner.run();
            });
            it("should be handled properly", () => {
                streamData.onNext({
                    type: "OtherEvent", payload: null, timestamp: new Date(200), splitKey: null
                });
                expect(notifications[0].clock).to.eql(new Date(0));
                expect(notifications[1].clock).to.eql(new Date(100));
                expect(notifications[2].clock).to.eql(new Date(200));
            });
        });
    });

    context("when a new tick is scheduled", () => {
        beforeEach(() => {
            let projectionRunner = new ProjectionRunner(projection, new MockStreamFactory(streamData), new Matcher(projection.definition),
                new MockReadModelFactory(), tickScheduler, dateRetriever);
            projectionRunner.notifications().subscribe(event => notifications.push(event.payload));
            projectionRunner.run();
        });

        context("and the projection is still fetching historical events", () => {
            it("should schedule the tick after the other events", () => {
                streamData.onNext({
                    type: "OtherEvent", payload: null, timestamp: new Date(50), splitKey: null
                });
                streamData.onNext({
                    type: "TickTrigger", payload: null, timestamp: new Date(60), splitKey: null
                });
                streamData.onNext({
                    type: "OtherEvent", payload: null, timestamp: new Date(200), splitKey: null
                });
                expect(notifications[0].clock).to.eql(new Date(0));
                expect(notifications[1].clock).to.eql(new Date(50));
                expect(notifications[2].clock).to.eql(new Date(50));
                expect(notifications[3].clock).to.eql(new Date(150));
                expect(notifications[4].clock).to.eql(new Date(200));
            });
            context("and a new tick is scheduled between the current and the next event", () => {
                it("should process this tick correctly", () => {
                    streamData.onNext({
                        type: "TickBetweenTrigger", payload: null, timestamp: new Date(50), splitKey: null
                    });
                    streamData.onNext({
                        type: "OtherEvent", payload: null, timestamp: new Date(900), splitKey: null
                    });
                    expect(notifications[0].clock).to.eql(new Date(0));
                    expect(notifications[1].clock).to.eql(new Date(0));
                    expect(notifications[2].clock).to.eql(new Date(100));
                    expect(notifications[3].clock).to.eql(new Date(200));
                    expect(notifications[4].clock).to.eql(new Date(900));
                });
            });
        });

        context("and it's past the system clock", () => {
            it("should delay it in the future", (done) => {
                streamData.onNext({
                    type: "OtherEvent", payload: null, timestamp: new Date(50), splitKey: null
                });
                dateRetriever.setDate(new Date(300));
                streamData.onNext({
                    type: "FutureTick", payload: null, timestamp: new Date(60), splitKey: null
                });
                expect(notifications[0].clock).to.eql(new Date(0));
                expect(notifications[1].clock).to.eql(new Date(50));
                expect(notifications[2].clock).to.eql(new Date(50));
                expect(notifications[3]).to.be(undefined);
                setTimeout(() => {
                    expect(notifications[3].clock).to.eql(new Date(500));
                    done();
                }, 1000);
            });
        });

        context("when the next event to process is a read model", () => {
            it("should be scheduled without the historical scheduler", () => {
                streamData.onNext({
                    type: "OtherEvent", payload: null, timestamp: new Date(50), splitKey: null
                });
                streamData.onNext({
                    type: "TickTrigger", payload: null, timestamp: new Date(60), splitKey: null
                });
                streamData.onNext({
                    type: "OtherEvent", payload: null, timestamp: null, splitKey: null
                });
                streamData.onNext({
                    type: "OtherEvent", payload: null, timestamp: new Date(300), splitKey: null
                });
                expect(notifications[0].clock).to.eql(new Date(0));
                expect(notifications[1].clock).to.eql(new Date(50));
                expect(notifications[2].clock).to.eql(new Date(50));
                expect(notifications[3].clock).to.eql(new Date(0));
                expect(notifications[4].clock).to.eql(new Date(150));
                expect(notifications[5].clock).to.eql(new Date(300));
            });
        });

        context("when the projection is going real time", () => {
            it("should flush the buffer of ticks", () => {
                streamData.onNext({
                    type: "OtherEvent", payload: null, timestamp: new Date(50), splitKey: null
                });
                streamData.onNext({
                    type: "TickTrigger", payload: null, timestamp: new Date(60), splitKey: null
                });
                streamData.onNext({
                    type: ReservedEvents.REALTIME, payload: null, timestamp: new Date(110), splitKey: null
                });
                expect(notifications[0].clock).to.eql(new Date(0));
                expect(notifications[1].clock).to.eql(new Date(50));
                expect(notifications[2].clock).to.eql(new Date(50));
                expect(notifications[3].clock).to.eql(new Date(150));
            });
        });

        context("and the projection is fetching  real time events", () => {
            it("should schedule the tick in the future", (done) => {
                streamData.onNext({
                    type: "OtherEvent", payload: null, timestamp: new Date(50), splitKey: null
                });
                streamData.onNext({
                    type: ReservedEvents.REALTIME, payload: null, timestamp: new Date(110), splitKey: null
                });
                streamData.onNext({
                    type: "TickTrigger", payload: null, timestamp: new Date(150), splitKey: null
                });
                expect(notifications[0].clock).to.eql(new Date(0));
                expect(notifications[1].clock).to.eql(new Date(50));
                expect(notifications[2].clock).to.eql(new Date(50));
                expect(notifications[3]).to.be(undefined);
                setTimeout(() => {
                    expect(notifications[3].clock).to.eql(new Date(150));
                    done();
                }, 200);
            });
        });
    });

    context("when a tick is scheduled for a split projection", () => {
        let projectionRunner:IProjectionRunner<Tick>;
        beforeEach(() => {
            projectionRunner = new SplitProjectionRunner<Tick>(projection, new MockStreamFactory(streamData), new Matcher(projection.definition),
                new Matcher(projection.split), new MockReadModelFactory(), tickScheduler, dateRetriever);
            projectionRunner.notifications().subscribe(event => notifications.push(event.payload));
            projectionRunner.run();
        });

        it("should dispatch the ticks to right projections", () => {
            streamData.onNext({
                type: "SplitTrigger", payload: {id: "20"}, timestamp: new Date(50), splitKey: null
            });
            streamData.onNext({
                type: "SplitTrigger", payload: {id: "40"}, timestamp: new Date(60), splitKey: null
            });
            streamData.onNext({
                type: "SplitTrigger", payload: {id: "20"}, timestamp: new Date(180), splitKey: null
            });
            streamData.onNext({
                type: "SplitTrigger", payload: {id: "foo"}, timestamp: new Date(300), splitKey: null
            });
            expect(projectionRunner.state["20"].clock).to.eql(new Date(200));
            expect(projectionRunner.state["40"].clock).to.eql(new Date(100));
        });
    });
});