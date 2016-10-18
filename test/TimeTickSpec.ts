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

describe("TimeTick, given a tick scheduler and a projection", () => {

    let projection:IProjection<number>;
    let tickScheduler:ITickScheduler;
    let streamData:Subject<Event>;
    let notifications:Event[];

    beforeEach(() => {
        notifications = [];
        tickScheduler = new TickScheduler();
        projection = new TickProjectionDefinition().define(tickScheduler);
        streamData = new Subject<Event>();
        let projectionRunner = new ProjectionRunner(null, new MockStreamFactory(streamData), new Matcher(projection.definition), new MockReadModelFactory());
        projectionRunner.subscribe(event => notifications.push(event));
    });

    context("when a new tick is scheduled", () => {
        it("should send a new tick event to the projection");
        context("and it's scheduled to be before another tick", () => {
            it("should send the ticks in the correct order");
        });
        context("and the projection schedules new ticks when receiving one", () => {
            it("should schedule also those ticks");
        });
    });
});