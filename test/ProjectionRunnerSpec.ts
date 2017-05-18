import "reflect-metadata";
import ProjectionRunner from "../scripts/projections/ProjectionRunner";
import {SpecialNames} from "../scripts/matcher/SpecialNames";
import {IMatcher} from "../scripts/matcher/IMatcher";
import {IStreamFactory} from "../scripts/streams/IStreamFactory";
import {Observable, Subject, IDisposable} from "rx";
import {IMock, Mock, Times, It} from "typemoq";
import expect = require("expect.js");
import * as Rx from "rx";
import IReadModelFactory from "../scripts/streams/IReadModelFactory";
import {Event} from "../scripts/streams/Event";
import {Snapshot} from "../scripts/snapshots/ISnapshotRepository";
import ReservedEvents from "../scripts/streams/ReservedEvents";
import {IProjection} from "../scripts/projections/IProjection";
import * as lolex from "lolex";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";
import Identity from "../scripts/matcher/Identity";
import {IProjectionStreamGenerator} from "../scripts/projections/ProjectionStreamGenerator";

describe("Given a ProjectionRunner", () => {
    let streamGenerator: IMock<IProjectionStreamGenerator>;
    let subject: ProjectionRunner<number>;
    let matcher: IMock<IMatcher>;
    let notifications: number[];
    let stopped: boolean;
    let failed: boolean;
    let subscription: IDisposable;
    let readModelFactory: IMock<IReadModelFactory>;
    let projection: IProjection<number>;
    let clock: lolex.Clock;
    let realtimeNotifier: Subject<string>;

    beforeEach(() => {
        clock = lolex.install();
        projection = new MockProjectionDefinition().define();
        notifications = [];
        stopped = false;
        failed = false;
        streamGenerator = Mock.ofType<IProjectionStreamGenerator>();
        matcher = Mock.ofType<IMatcher>();
        readModelFactory = Mock.ofType<IReadModelFactory>();
        realtimeNotifier = new Subject<string>();
        subject = new ProjectionRunner<number>(projection, streamGenerator.object, matcher.object, readModelFactory.object, realtimeNotifier);
        subscription = subject.notifications().subscribe((state: Event) => notifications.push(state.payload), e => failed = true, () => stopped = true);
    });

    afterEach(() => {
        subscription.dispose();
        clock.uninstall();
    });

    function completeStream() {
        return new Promise((resolve, reject) => {
            subject.notifications().subscribe(() => null, reject, resolve);
        });
    }

    context("when initializing a projection", () => {
        beforeEach(() => {
            streamGenerator.setup(s => s.generate(It.isAny(), It.isAny(), It.isAny())).returns(_ => Observable.empty<Event>());
            matcher.setup(m => m.match(SpecialNames.Init)).returns(streamId => () => 42);
        });

        context("if a snapshot is present", () => {
            beforeEach(() => {
                subject.run(new Snapshot(56, new Date(5000)));
            });

            it("should create an initial state based on snapshot memento", () => {
                expect(subject.state).to.be(56);
            });
        });

        context("if a snapshot is not present", () => {
            beforeEach(() => {
                subject.run();
            });
            it("should create an initial state based on the projection definition", () => {
                matcher.verify(m => m.match(SpecialNames.Init), Times.once());
            });

            it("should consider the initial state as the projection state", () => {
                expect(subject.state).to.be(42);
            });
            it("should notify that the projection has been initialized", () => {
                expect(notifications).to.eql([42]);
            });
        });
    });

    context("when receiving an event from a stream", () => {
        beforeEach(() => {
            matcher.setup(m => m.match(SpecialNames.Init)).returns(streamId => () => 42);
        });

        context("and no error occurs", () => {

            beforeEach(() => {
                let date = new Date();
                streamGenerator.setup(s => s.generate(It.isAny(), It.isAny(), It.isAny())).returns(_ => Observable.range(1, 5).map(n => {
                    return {type: "increment", payload: n, timestamp: new Date(+date + n), splitKey: null};
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

                it("should publish on the event stream the new aggregate state", () => {
                    clock.tick(100);
                    readModelFactory.verify(a => a.publish(It.isValue({
                        type: "test",
                        payload: 42 + 1 + 2 + 3 + 4 + 5,
                        timestamp: null,
                        splitKey: null
                    })), Times.atLeastOnce());
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
                    return {type: "increment" + n, payload: n, timestamp: new Date(+date + n), splitKey: null};
                }));
                matcher.setup(m => m.match("increment1")).returns(streamId => Identity);
                matcher.setup(m => m.match("increment2")).returns(streamId => (s: number, e: any) => s + e);
                matcher.setup(m => m.match("increment3")).returns(streamId => (s: number, e: any) => s + e);
                matcher.setup(m => m.match("increment4")).returns(streamId => Identity);
                matcher.setup(m => m.match("increment5")).returns(streamId => Identity);
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
                clock.uninstall();
                matcher.setup(m => m.match("increment")).returns(streamId => (s: number, e: any) => {
                    throw new Error("Kaboom!");
                });
                streamGenerator.setup(s => s.generate(It.isAny(), It.isAny(), It.isAny())).returns(_ => Observable.range(1, 5).map(n => {
                    return {type: "increment", payload: n, timestamp: new Date(), splitKey: null};
                }).observeOn(Rx.Scheduler.immediate));
            });
            it("should notify an error", () => {
                subject.run();
                expect(failed).to.be.ok();
            });
        });

        context("and it's a realtime event", () => {
            let realtimeNotifications: string[] = [];
            beforeEach(async () => {
                matcher.setup(m => m.match(ReservedEvents.REALTIME)).returns(streamId => Identity);
                streamGenerator.setup(s => s.generate(It.isAny(), It.isAny(), It.isAny())).returns(_ => Observable.just({
                    type: "__prettygoat_internal_realtime",
                    payload: null,
                    timestamp: null,
                    splitKey: null
                }));
                realtimeNotifier.subscribe(value => realtimeNotifications.push(value));
                subject.run();
                await completeStream();
            });
            it("should notify the completions service", () => {
                expect(realtimeNotifications).to.have.length(1);
                expect(realtimeNotifications[0]).to.be("test");
            });
        });
    });

    context("when receiving a readmodel", () => {
        beforeEach(() => {
            matcher.setup(m => m.match(SpecialNames.Init)).returns(streamId => () => 42);
            streamGenerator.setup(s => s.generate(It.isAny(), It.isAny(), It.isAny())).returns(_ => Observable.just({
                type: "test2", payload: 1, splitKey: null, timestamp: null
            }));
            matcher.setup(m => m.match("test2")).returns(streamId => (s: number, e: any) => s + e);
            subject.run();
        });
        it("should update the readmodels processed counter", () => {
            expect(subject.stats.readModels).to.be(1);
        });
    });

    context("when stopping a projection", () => {
        let streamSubject = new Subject<any>();
        beforeEach(async () => {
            matcher.setup(m => m.match(SpecialNames.Init)).returns(streamId => () => 42);
            matcher.setup(m => m.match("increment")).returns(streamId => (s: number, e: any) => s + e);
            matcher.setup(m => m.match(ReservedEvents.REALTIME)).returns(streamId => Identity);
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
