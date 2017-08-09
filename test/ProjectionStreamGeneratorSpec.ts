import "reflect-metadata";
import expect = require("expect.js");
import {IMock, Mock, Times, It} from "typemoq";
import {ProjectionStreamGenerator} from "../scripts/projections/ProjectionStreamGenerator";
import {Observable, Subject} from "rxjs";
import {ISubscription} from "rxjs/Subscription";
import {IProjection} from "../scripts/projections/IProjection";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";
import {Snapshot} from "../scripts/snapshots/ISnapshotRepository";
import {IStreamFactory} from "../scripts/events/IStreamFactory";
import {Event} from "../scripts/events/Event";

describe("Given a projection stream generator", () => {

    let subject: ProjectionStreamGenerator;
    let stream: IMock<IStreamFactory>;
    let notifications: Event[];
    let stopped: boolean;
    let failed: boolean;
    let subscription: ISubscription;
    let projection: IProjection<number>;
    let completions = new Subject<string>();

    beforeEach(() => {
        projection = new MockProjectionDefinition().define();
        notifications = [];
        stopped = false;
        failed = false;
        stream = Mock.ofType<IStreamFactory>();
        subject = new ProjectionStreamGenerator(stream.object);
    });

    afterEach(() => {
        if (subscription) subscription.unsubscribe();
    });

    context("when initializing a stream", () => {
        beforeEach(() => {
            stream.setup(s => s.from(It.isAny(), It.isAny(), It.isAny())).returns(_ => Observable.empty<Event>());
        });

        context("if a snapshot is present", () => {
            beforeEach(() => {
                subject.generate(projection, new Snapshot(56, new Date(5000)), completions);
            });
            it("should subscribe to the event stream starting from the snapshot timestamp", () => {
                stream.verify(s => s.from(It.isValue(new Date(5000)), It.isValue(completions), It.isValue(projection.definition)), Times.once());
            });
        });

        context("if a snapshot is not present", () => {
            beforeEach(() => {
                subject.generate(projection, null, completions);
            });
            it("should subscribe to the event stream starting from the stream's beginning", () => {
                stream.verify(s => s.from(null, It.isValue(completions), It.isValue(projection.definition)), Times.once());
            });
        });
    });

    context("when receiving an event from a stream", () => {
        beforeEach(() => {
            stream.setup(s => s.from(null, It.isAny(), It.isAny())).returns(_ => Observable.of({
                type: "CassandraEvent",
                payload: 1,
                timestamp: new Date()
            }));
            subscription = subject.generate(projection, null, null).subscribe(event => notifications.push(event));
        });
        it("it should be processed", () => {
            expect(notifications).to.have.length(1);
        });
    });
});
