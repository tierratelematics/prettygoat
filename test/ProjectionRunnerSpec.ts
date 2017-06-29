import "reflect-metadata";
import ProjectionRunner from "../scripts/projections/ProjectionRunner";
import {Observable, Subject, IDisposable} from "rx";
import {IMock, Mock, Times, It} from "typemoq";
import expect = require("expect.js");
import * as Rx from "rx";
import {Event} from "../scripts/events/Event";
import {Snapshot} from "../scripts/snapshots/ISnapshotRepository";
import {IProjection} from "../scripts/projections/IProjection";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";
import {IProjectionStreamGenerator} from "../scripts/projections/ProjectionStreamGenerator";
import {IMatcher} from "../scripts/projections/Matcher";
import SpecialEvents from "../scripts/events/SpecialEvents";

describe("Given a ProjectionRunner", () => {
    let streamGenerator: IMock<IProjectionStreamGenerator>;
    let subject: ProjectionRunner<number>;
    let matcher: IMock<IMatcher>;
    let notifications: number[];
    let timestamps: Date[];
    let stopped: boolean;
    let failed: boolean;
    let subscription: IDisposable;
    let projection: IProjection<number>;

    beforeEach(() => {
        projection = new MockProjectionDefinition().define();
        notifications = [];
        timestamps = [];
        stopped = false;
        failed = false;
        streamGenerator = Mock.ofType<IProjectionStreamGenerator>();
        matcher = Mock.ofType<IMatcher>();
        subject = new ProjectionRunner<number>(projection, streamGenerator.object, matcher.object);
        subscription = subject.notifications().subscribe(event => {
            notifications.push(event.payload);
            timestamps.push(event.timestamp);
        }, e => failed = true, () => stopped = true);
    });

    afterEach(() => {
        subscription.dispose();
    });

    function completeStream() {
        return new Promise((resolve, reject) => {
            subject.notifications().subscribe(() => null, reject, resolve);
        });
    }

    context("when initializing a projection", () => {
        beforeEach(() => {
            streamGenerator.setup(s => s.generate(It.isAny(), It.isAny(), It.isAny())).returns(_ => Observable.empty<Event>());
            matcher.setup(m => m.match("$init")).returns(streamId => () => 42);
        });

        context("if a snapshot is present", () => {
            beforeEach(() => {
                subject.run(new Snapshot(56, new Date(5000)));
            });

            it("should create an initial state based on snapshot memento", () => {
                expect(subject.state).to.be(56);
            });

            it("should notify with the snapshot timestamp", () => {
                expect(timestamps[0]).to.eql(new Date(5000));
            });
        });

        context("if a snapshot is not present", () => {
            beforeEach(() => {
                subject.run();
            });
            it("should create an initial state based on the projection definition", () => {
                matcher.verify(m => m.match("$init"), Times.once());
            });

            it("should consider the initial state as the projection state", () => {
                expect(subject.state).to.be(42);
            });
            it("should notify that the projection has been initialized", () => {
                expect(notifications).to.eql([42]);
            });
            it("should notify with an initial timestamp", () => {
                expect(timestamps[0]).to.eql(new Date(1));
            });
        });
    });

    context("when the projection has gone realtime", () => {
        beforeEach(async () => {
            streamGenerator.setup(s => s.generate(It.isAny(), It.isAny(), It.isAny())).returns(_ => Observable.just({
                type: SpecialEvents.REALTIME,
                payload: null,
                timestamp: null
            }));
            subject.run();
            await completeStream();
        });
        it("should set it on stats", () => {
            expect(subject.stats.realtime).to.be(true);
        });
    });

    context("when receiving an event from a stream", () => {
        beforeEach(() => {
            matcher.setup(m => m.match("$init")).returns(streamId => () => 42);
        });

        context("and no error occurs", () => {

            beforeEach(() => {
                let date = new Date(5000);
                streamGenerator.setup(s => s.generate(It.isAny(), It.isAny(), It.isAny())).returns(_ => Observable.range(1, 5).map(n => {
                    return {type: "increment", payload: n, timestamp: new Date(+date + n)};
                }));
            });

            context("and an async event handler is not used", () => {
                beforeEach(async () => {
                    matcher.setup(m => m.match("increment")).returns(streamId => (s: number, e: any) => s + e);
                    subject.run();
                    await completeStream();
                });
                it("should match the event with the projection definition", () => {
                    matcher.verify(m => m.match("increment"), Times.exactly(5));
                });
                it("should consider the returned state as the projection state", () => {
                    expect(subject.state).to.be(42 + 1 + 2 + 3 + 4 + 5);
                });
                it("should notify that the projection has been updated", () => {
                    expect(notifications).to.be.eql([
                        42,
                        42 + 1,
                        42 + 1 + 2,
                        42 + 1 + 2 + 3,
                        42 + 1 + 2 + 3 + 4,
                        42 + 1 + 2 + 3 + 4 + 5
                    ]);
                });

                it("should update the events processed counter", () => {
                    expect(subject.stats.events).to.be(5);
                });

                it("should set the latest timestamp", () => {
                    expect(subject.stats.lastEvent).to.eql(new Date(5005));
                });
            });

            context("and an async event handler is used", () => {
                beforeEach(async () => {
                    matcher.setup(m => m.match("increment")).returns(streamId => (s: number, e: any) => Promise.resolve(s + e));
                    subject.run();
                    await completeStream();
                });
                it("should construct the state correctly", () => {
                    expect(subject.state).to.be(42 + 1 + 2 + 3 + 4 + 5);
                });
            });
        });

        context("and no match is found for this event", () => {
            beforeEach(async () => {
                let date = new Date();
                streamGenerator.setup(s => s.generate(It.isAny(), It.isAny(), It.isAny())).returns(_ => Observable.range(1, 5).map(n => {
                    return {type: "increment" + n, payload: n, timestamp: new Date(+date + n)};
                }));
                matcher.setup(m => m.match("increment1")).returns(streamId => null);
                matcher.setup(m => m.match("increment2")).returns(streamId => (s: number, e: any) => s + e);
                matcher.setup(m => m.match("increment3")).returns(streamId => (s: number, e: any) => s + e);
                matcher.setup(m => m.match("increment4")).returns(streamId => null);
                matcher.setup(m => m.match("increment5")).returns(streamId => null);
                subject.run();
                await completeStream();
            });

            it("should not notify a state change", () => {
                expect(notifications).to.be.eql([
                    42,
                    42 + 2,
                    42 + 2 + 3
                ]);
            });
        });

        context("and an error occurs while processing the event", () => {
            beforeEach(() => {
                matcher.setup(m => m.match("increment")).returns(streamId => (s: number, e: any) => {
                    throw new Error("Kaboom!");
                });
                streamGenerator.setup(s => s.generate(It.isAny(), It.isAny(), It.isAny())).returns(_ => Observable.range(1, 5).map(n => {
                    return {type: "increment", payload: n, timestamp: new Date()};
                }).observeOn(Rx.Scheduler.immediate));
            });
            it("should notify an error", () => {
                subject.run();
                expect(failed).to.be.ok();
            });
        });
    });

    context("when stopping a projection", () => {
        let streamSubject = new Subject<any>();
        beforeEach(async () => {
            matcher.setup(m => m.match("$init")).returns(streamId => () => 42);
            matcher.setup(m => m.match("increment")).returns(streamId => (s: number, e: any) => s + e);
            matcher.setup(m => m.match(SpecialEvents.REALTIME)).returns(streamId => null);
            streamGenerator.setup(s => s.generate(It.isAny(), It.isAny(), It.isAny())).returns(_ => streamSubject);

            subject.run();
            subject.stop();
            streamSubject.onNext({type: "increment", payload: 1, timestamp: new Date(501)});
            streamSubject.onNext({type: "increment", payload: 2, timestamp: new Date(502)});
            await completeStream();
        });
        it("should not process any more events", () => {
            expect(notifications).to.eql([
                42
            ]);
        });
        it("should notify that the projection has been stopped", () => {
            expect(stopped).to.be.ok();
        });

        context("and the projection is started again", () => {
            it("should throw an error", () => {
                expect(() => subject.run()).to.throwError();
            });
        });

        context("but the projection is already stopped", () => {
            it("should throw an error", () => {
                expect(() => subject.stop()).to.throwError();
            });
        });

    });
});
