import "reflect-metadata";
import expect = require("expect.js");
import {IMock, Mock, Times, It} from "typemoq";
import SplitProjectionRunner from "../scripts/projections/SplitProjectionRunner";
import {Observable, IDisposable, Subject} from "rx";
import IReadModelFactory from "../scripts/streams/IReadModelFactory";
import SplitProjectionDefinition from "./fixtures/definitions/SplitProjectionDefinition";
import {Matcher} from "../scripts/matcher/Matcher";
import {Event} from "../scripts/streams/Event";
import {Snapshot} from "../scripts/snapshots/ISnapshotRepository";
import Dictionary from "../scripts/util/Dictionary";
import {IProjectionStreamGenerator} from "../scripts/projections/ProjectionStreamGenerator";

describe("Split projection, given a projection with a split definition", () => {

    let subject: SplitProjectionRunner<number>;
    let stream: IMock<IProjectionStreamGenerator>;
    let notifications: Event[];
    let stopped: boolean;
    let failed: boolean;
    let subscription: IDisposable;
    let readModelFactory: IMock<IReadModelFactory>;
    let projection = new SplitProjectionDefinition().define();

    beforeEach(() => {
        notifications = [];
        stopped = false;
        failed = false;
        stream = Mock.ofType<IProjectionStreamGenerator>();
        readModelFactory = Mock.ofType<IReadModelFactory>();
        subject = new SplitProjectionRunner<number>(projection, stream.object, new Matcher(projection.definition),
            new Matcher(projection.split), readModelFactory.object);
        subscription = subject.notifications().subscribe(notification => notifications.push(notification[0]), e => failed = true, () => stopped = true);
    });

    function completeStream() {
        return new Promise((resolve, reject) => {
            subject.notifications().subscribe(() => null, reject, resolve);
        });
    }

    context("when initializing the projection", () => {
        context("and a snapshot is present", () => {
            beforeEach(async () => {
                stream.setup(s => s.generate(It.isAny(), It.isAny(), It.isAny())).returns(() => Observable.just({
                    type: "LinkedState",
                    payload: {
                        count2: 2000
                    },
                    timestamp: new Date(1), splitKey: null
                }));
                subject.run(new Snapshot(<Dictionary<number>>{
                    "10a": 2000,
                    "25b": 5600
                }, new Date(5000)));
                await completeStream();
            });
            it("should construct the snapshotted projections", () => {
                expect(subject.state["10a"]).to.be(4000);
                expect(subject.state["25b"]).to.be(7600);
            });
        });
    });

    context("when a new event is received", () => {
        context("and the event is not defined", () => {
            beforeEach(async () => {
                stream.setup(s => s.generate(It.isAny(), It.isAny(), It.isAny())).returns(() => Observable.create<Event>(observer => {
                    observer.onNext({
                        type: "TestEvent",
                        payload: {
                            count: 20,
                            id: "10"
                        },
                        timestamp: new Date(10), splitKey: null
                    });
                    observer.onNext({type: "invalid", payload: 10, timestamp: new Date(20), splitKey: null});
                    observer.onNext({
                        type: "TestEvent",
                        payload: {
                            count: 50,
                            id: "10"
                        },
                        timestamp: new Date(30), splitKey: null
                    });
                    observer.onCompleted();
                }));
                subject.run();
                await completeStream();
            });
            it("should continue replaying the stream", () => {
                expect(subject.state["10"]).to.be(80);
            });
        });

        context("and the corresponding split key must be generated asynchronously", () => {
            beforeEach(async () => {
                stream.setup(s => s.generate(It.isAny(), It.isAny(), It.isAny())).returns(() => Observable.just({
                    type: "SplitAsync",
                    payload: {
                        count: 50,
                        id: "10"
                    },
                    timestamp: new Date(30), splitKey: null
                }));
                subject.run(new Snapshot(<Dictionary<number>>{
                    "10": 30
                }, null));
                await completeStream();
            });
            it("should correctly update the projection state", () => {
                expect(subject.state["10"]).to.be(80);
            });
        });

        context("and a state is present for the generated split key", () => {
            context("if the event handler is synchronous", () => {
                beforeEach(async () => {
                    stream.setup(s => s.generate(It.isAny(), It.isAny(), It.isAny())).returns(() => Observable.just({
                        type: "TestEvent",
                        payload: {
                            count: 50,
                            id: "10"
                        },
                        timestamp: new Date(30), splitKey: null
                    }));
                    subject.run(new Snapshot(<Dictionary<number>>{
                        "10": 30
                    }, null));
                    await completeStream();
                });
                it("should update the projection state", () => {
                    expect(subject.state["10"]).to.be(80);
                });

                it("should notify that the read model has changed", () => {
                    expect(notifications).to.have.length(1);
                    expect(notifications[0].splitKey).to.be("10");
                    expect(notifications[0].payload).to.be(80);
                });
            });

            context("if the event handler is asynchronous", () => {
                beforeEach(async () => {
                    stream.setup(s => s.generate(It.isAny(), It.isAny(), It.isAny())).returns(() => Observable.just({
                        type: "Async",
                        payload: {
                            count: 1000,
                            id: "10"
                        },
                        timestamp: new Date(30), splitKey: null
                    }));
                    subject.run(new Snapshot(<Dictionary<number>>{
                        "10": 30
                    }, null));
                    await completeStream();
                });
                it("should update the projection state", () => {
                    expect(subject.state["10"]).to.be(1030);
                });
            });
        });

        context("and a state is not present for the generated split key", () => {
            beforeEach(async () => {
                readModelFactory.setup(r => r.asList()).returns(a => [
                    {
                        type: "LinkedState",
                        payload: {
                            count2: 2000
                        },
                        timestamp: new Date(30), splitKey: null
                    }
                ]);
                stream.setup(s => s.generate(It.isAny(), It.isAny(), It.isAny())).returns(() => Observable.just({
                    type: "TestEvent",
                    payload: {
                        count: 20,
                        id: "10"
                    },
                    timestamp: new Date(10), splitKey: null
                }));
                subject.run();
                await completeStream();
            });
            it("should initialize the new projection by pushing all the generated read models", () => {
                expect(subject.state["10"]).to.be(2030);
            });
        });

        context("and the event is a read model", () => {
            beforeEach(async () => {
                stream.setup(s => s.generate(It.isAny(), It.isAny(), It.isAny())).returns(() => Observable.create<Event>(observer => {
                    observer.onNext({
                        type: "TestEvent",
                        payload: {
                            count: 20,
                            id: "10"
                        },
                        timestamp: new Date(10), splitKey: null
                    });
                    observer.onNext({
                        type: "LinkedState",
                        payload: {
                            count2: 5000
                        },
                        timestamp: new Date(30), splitKey: null
                    });
                    observer.onCompleted();
                }));
                subject.run();
                await completeStream();
            });

            it("should dispatch the read model to all the projections", () => {
                expect(subject.state["10"]).to.be(5030);
            });

            it("should notify the changes of the states", () => {
                expect(notifications).to.have.length(2);
                expect(notifications[1].payload).to.be(5030);
                expect(notifications[1].splitKey).to.be("10");
            });
        });

        context("and it will trigger multiple split keys", () => {
            beforeEach(async () => {
                stream.setup(s => s.generate(It.isAny(), It.isAny(), It.isAny())).returns(() => Observable.just({
                    type: "MultipleKeys",
                    payload: {
                        count: 20,
                        splits: ["10", "27a", "35c"]
                    },
                    timestamp: new Date(10), splitKey: null
                }));
                subject.run();
                await completeStream();
            });
            it("should be dispatched to all the projections", () => {
                expect(subject.state["10"]).to.be(30);
                expect(subject.state["27a"]).to.be(30);
                expect(subject.state["35c"]).to.be(30);
            });
        });
    });
});