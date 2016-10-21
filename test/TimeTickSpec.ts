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
import MockDateRetriever from "./fixtures/MockDateRetriever";
import Tick from "../scripts/ticks/Tick";
import ReservedEvents from "../scripts/streams/ReservedEvents";

describe("TimeTick, given a tick scheduler and a projection", () => {

    let projection:IProjection<Tick>;
    let tickScheduler:ITickScheduler;
    let streamData:Subject<Event>;
    let notifications:Tick[];

    beforeEach(() => {
        notifications = [];
        tickScheduler = new TickScheduler(new MockDateRetriever(new Date(0)));
        projection = new TickProjectionDefinition().define(tickScheduler);
        streamData = new Subject<Event>();
        let projectionRunner = new ProjectionRunner("Tick", new MockStreamFactory(streamData), new Matcher(projection.definition),
            new MockReadModelFactory(), tickScheduler);
        projectionRunner.notifications().subscribe(event => notifications.push(event.payload));
        projectionRunner.run();
    });

    context("when a new tick is scheduled", () => {
        context("and the projection is still fetching historical events", () => {
            it("should schedule the tick between the other events", () => {
                streamData.onNext({
                    type: "OtherEvent", payload: null, timestamp: new Date(50), splitKey: null
                });

                expect(notifications[0].clock).to.eql(new Date(0));
                expect(notifications[1].clock).to.eql(new Date(50));
                expect(notifications[2].clock).to.eql(new Date(100));
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
                expect(notifications[2].clock).to.eql(new Date(100));
                expect(notifications[3].clock).to.eql(new Date(100));
                expect(notifications[4]).to.be(undefined);
                setTimeout(() => {
                    expect(notifications[4].clock).to.eql(new Date(200));
                    done();
                }, 200);
            });
        });
    });
});