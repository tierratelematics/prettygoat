import "reflect-metadata";
import expect = require("expect.js");
import {Mock, IMock, It} from "typemoq";
import {Subject} from "rx";
import {IProjection} from "../scripts/projections/IProjection";
import ITickScheduler from "../scripts/ticks/ITickScheduler";
import TickScheduler from "../scripts/ticks/TickScheduler";
import {Event} from "../scripts/events/Event";
import ReservedEvents from "../scripts/events/ReservedEvents";
import MockDateRetriever from "./fixtures/MockDateRetriever";
import {IProjectionStreamGenerator, ProjectionStreamGenerator} from "../scripts/projections/ProjectionStreamGenerator";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";
import {IStreamFactory} from "../scripts/events/IStreamFactory";

describe("TimeTick, given a tick scheduler and a projection", () => {

    let projection: IProjection<any>;
    let tickScheduler: ITickScheduler;
    let streamData: Subject<Event>;
    let notifications: Event[];
    let dateRetriever: MockDateRetriever;
    let stream: IMock<IStreamFactory>;
    let subject: IProjectionStreamGenerator;

    beforeEach(() => {
        notifications = [];
        dateRetriever = new MockDateRetriever(new Date(3000));
        tickScheduler = new TickScheduler(new MockDateRetriever(new Date(0)));
        projection = new MockProjectionDefinition().define();
        streamData = new Subject<Event>();
        stream = Mock.ofType<IStreamFactory>();
        stream.setup(s => s.from(It.isAny(), It.isAny(), It.isAny())).returns(() => streamData);
        subject = new ProjectionStreamGenerator(stream.object, {
            "Mock": tickScheduler
        }, dateRetriever);
        subject.generate(projection, null, null).subscribe(event => notifications.push(event));
    });

    context("when a new tick is scheduled", () => {
        context("and the projection is still fetching historical events", () => {
            it("should schedule the tick after the other events", () => {
                streamData.onNext({
                    type: "TickTrigger", payload: null, timestamp: new Date(60)
                });
                tickScheduler.schedule(new Date(100));
                streamData.onNext({
                    type: "OtherEvent", payload: null, timestamp: new Date(200)
                });

                expect(notifications[0].type).to.eql("TickTrigger");
                expect(notifications[1].type).to.eql("Tick");
                expect(notifications[1].payload.clock).to.eql(new Date(100));
            });
        });

        context("and it's past the system clock", () => {
            it("should delay it in the future", (done) => {
                dateRetriever.setDate(new Date(300));
                tickScheduler.schedule(new Date(500));

                expect(notifications[0]).not.to.be.ok();
                setTimeout(() => {
                    expect(notifications[0].payload.clock).to.eql(new Date(500));
                    done();
                }, 500);
            });
        });

        context("when it's scheduled with a state", () => {
            it("should carry it when accessing the event", () => {
                tickScheduler.schedule(new Date(100), "state");
                streamData.onNext({
                    type: "OtherEvent", payload: null, timestamp: new Date(300)
                });

                expect(notifications[0].payload.state).to.be("state");
            });
        });

        context("when the next event to process is a read model", () => {
            it("should be scheduled without the historical scheduler", () => {
                tickScheduler.schedule(new Date(100));
                streamData.onNext({
                    type: "ReadModel", payload: null, timestamp: null
                });
                streamData.onNext({
                    type: "OtherEvent", payload: null, timestamp: new Date(300)
                });

                expect(notifications[0].type).to.eql("ReadModel");
                expect(notifications[1].type).to.eql("Tick");
                expect(notifications[2].type).to.eql("OtherEvent");
            });
        });

        context("when the projection is going real time", () => {
            it("should flush the buffer of ticks", () => {
                tickScheduler.schedule(new Date(100));
                streamData.onNext({
                    type: ReservedEvents.REALTIME, payload: null, timestamp: new Date(110)
                });

                expect(notifications[0].type).to.eql("Tick");
                expect(notifications[0].payload.clock).to.eql(new Date(100));
                expect(notifications[1].type).to.eql(ReservedEvents.REALTIME);
            });
        });

        context("and the projection is fetching real time events", () => {
            it("should schedule the tick in the future", (done) => {
                streamData.onNext({
                    type: ReservedEvents.REALTIME, payload: null, timestamp: new Date(110)
                });
                tickScheduler.schedule(new Date(150));

                expect(notifications[0].type).to.eql(ReservedEvents.REALTIME);
                expect(notifications[1]).not.to.be.ok();
                setTimeout(() => {
                    expect(notifications[1].payload.clock).to.eql(new Date(150));
                    done();
                }, 200);
            });
        });
    });
});
