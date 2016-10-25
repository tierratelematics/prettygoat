import expect = require("expect.js");
import sinon = require("sinon");
import * as TypeMoq from "typemoq";
import SplitProjectionRunner from "../scripts/projections/SplitProjectionRunner";
import {Observable, Scheduler, ReplaySubject, IDisposable, Subject} from "rx";
import {IStreamFactory} from "../scripts/streams/IStreamFactory";
import IReadModelFactory from "../scripts/streams/IReadModelFactory";
import {MockStreamFactory} from "./fixtures/MockStreamFactory";
import ReadModelFactory from "../scripts/streams/ReadModelFactory";
import SplitProjectionDefinition from "./fixtures/definitions/SplitProjectionDefinition";
import {Matcher} from "../scripts/matcher/Matcher";
import {Event} from "../scripts/streams/Event";
import {Snapshot} from "../scripts/snapshots/ISnapshotRepository";
import Dictionary from "../scripts/Dictionary";

describe("Split projection, given a projection with a split definition", () => {

    let subject:SplitProjectionRunner<number>;
    let stream:TypeMoq.Mock<IStreamFactory>;
    let notifications:Event[];
    let stopped:boolean;
    let failed:boolean;
    let subscription:IDisposable;
    let readModelFactory:TypeMoq.Mock<IReadModelFactory>;
    let streamData:Subject<Event>;
    let readModelData:Subject<Event>;
    let projection = new SplitProjectionDefinition().define();

    beforeEach(() => {
        notifications = [];
        stopped = false;
        failed = false;
        streamData = new ReplaySubject<Event>();
        readModelData = new ReplaySubject<Event>();
        stream = TypeMoq.Mock.ofType<IStreamFactory>(MockStreamFactory);
        readModelFactory = TypeMoq.Mock.ofType<IReadModelFactory>(ReadModelFactory);
        subject = new SplitProjectionRunner<number>(projection.name, stream.object, new Matcher(projection.definition),
            new Matcher(projection.split), readModelFactory.object, new MockStreamFactory(Observable.empty<Event>()));
        subscription = subject.notifications().subscribe((event:Event) => notifications.push(event), e => failed = true, () => stopped = true);
    });

    context("when initializing the projection", () => {
        context("and a snapshot is present", () => {
            beforeEach(() => {
                stream.setup(s => s.from(TypeMoq.It.isAny())).returns(_ => streamData.observeOn(Scheduler.immediate));
                readModelFactory.setup(r => r.from(null)).returns(a => readModelData.observeOn(Scheduler.immediate));
                readModelData.onNext({
                    type: "LinkedState",
                    payload: {
                        count2: 2000
                    },
                    timestamp: null, splitKey: null
                });
                subject.run(new Snapshot(<Dictionary<number>>{
                    "10a": 2000,
                    "25b": 5600
                }, new Date(5000)));
            });
            it("should construct the snapshotted projections", () => {
                expect(subject.state["10a"]).to.be(4000);
                expect(subject.state["25b"]).to.be(7600);
            });
            it("should subscribe to the event stream starting from the snapshot timestamp", () => {
                stream.verify(s => s.from(TypeMoq.It.isValue(new Date(5000))), TypeMoq.Times.once());
            });
        });
    });

    context("when a new event is received", () => {
        beforeEach(() => {
            readModelFactory.setup(r => r.from(null)).returns(_ => Observable.empty<Event>());
            stream.setup(s => s.from(null)).returns(_ => streamData.observeOn(Scheduler.immediate));
            streamData.onNext({
                type: "TestEvent",
                payload: {
                    count: 20,
                    id: "10"
                },
                timestamp: null, splitKey: null
            });
        });

        context("and the event is not defined", () => {
            it("should continue replaying the stream", () => {
                subject.run();
                streamData.onNext({type: "invalid", payload: 10, timestamp: null, splitKey: null});
                streamData.onNext({
                    type: "TestEvent",
                    payload: {
                        count: 50,
                        id: "10"
                    },
                    timestamp: null, splitKey: null
                });
                expect(subject.state["10"]).to.be(80);
            });
        });

        context("and a state is present for the generated split key", () => {
            beforeEach(() => {
                subject.run();
                streamData.onNext({
                    type: "TestEvent",
                    payload: {
                        count: 50,
                        id: "10"
                    },
                    timestamp: null, splitKey: null
                });
            });

            it("should update the projection state", () => {
                expect(subject.state["10"]).to.be(80);
            });

            it("should notify that the read model has changed", () => {
                expect(notifications).to.have.length(2);
                expect(notifications[1].splitKey).to.be("10");
                expect(notifications[1].payload).to.be(80);
            });
        });

        context("and a state is not present for the generated split key", () => {
            beforeEach(() => {
                readModelFactory.setup(r => r.from(null)).returns(a => readModelData.observeOn(Scheduler.immediate));
                readModelData.onNext({
                    type: "LinkedState",
                    payload: {
                        count2: 2000
                    },
                    timestamp: null, splitKey: null
                });
            });
            it("should initialize the new projection by pushing all the generated read models", () => {
                subject.run();
                expect(subject.state["10"]).to.be(2030);
            });
        });

        context("and the event is a read model", () => {
            beforeEach(() => {
                readModelFactory.setup(r => r.from(null)).returns(a => readModelData.observeOn(Scheduler.immediate));
                readModelData.onNext({
                    type: "LinkedState",
                    payload: {
                        count2: 5000
                    },
                    timestamp: null, splitKey: null
                });
            });

            it("should dispatch the read model to all the projections", () => {
                subject.run();
                expect(subject.state["10"]).to.be(5030);
            });

            it("should notify the changes of the states", () => {
                subject.run();
                expect(notifications).to.have.length(2);
                expect(notifications[1].payload).to.be(5030);
                expect(notifications[1].splitKey).to.be("10");
            });

            context("of the same projection", () => {
                beforeEach(() => {
                    stream.setup(s => s.from(null)).returns(_ => streamData);
                    subject.run();
                });

                it("should filter it", () => {
                    streamData.onNext({type: "split", payload: 10, timestamp: null, splitKey: null});
                    expect(subject.state["10"]).to.be(5030);
                });
            });
        });
    });
});