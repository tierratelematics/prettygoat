import "reflect-metadata";
import {ProjectionRunner} from "../scripts/projections/ProjectionRunner";
import {SpecialNames} from "../scripts/matcher/SpecialNames";
import {IMatcher} from "../scripts/matcher/IMatcher";
import {IStreamFactory} from "../scripts/streams/IStreamFactory";
import {MockMatcher} from "./fixtures/MockMatcher";
import {MockStreamFactory} from "./fixtures/MockStreamFactory";
import {Observable, Subject, IDisposable, Scheduler} from "rx";
import * as TypeMoq from "typemoq";
import expect = require("expect.js");
import * as Rx from "rx";
import IReadModelFactory from "../scripts/streams/IReadModelFactory";
import {Event} from "../scripts/streams/Event";
import {Snapshot} from "../scripts/snapshots/ISnapshotRepository";
import MockDateRetriever from "./fixtures/MockDateRetriever";
import ReservedEvents from "../scripts/streams/ReservedEvents";
import {IProjection} from "../scripts/projections/IProjection";
import MockProjectionRunnerDefinition from "./fixtures/definitions/MockProjectionRunnerDefinition";
import MockReadModelFactory from "./fixtures/MockReadModelFactory";
import * as lolex from "lolex";

describe("Given a ProjectionRunner", () => {
    let stream: TypeMoq.IMock<IStreamFactory>;
    let subject: ProjectionRunner<number>;
    let matcher: TypeMoq.IMock<IMatcher>;
    let notifications: number[];
    let stopped: boolean;
    let failed: boolean;
    let subscription: IDisposable;
    let readModelFactory: TypeMoq.IMock<IReadModelFactory>;
    let projection:IProjection<number>;
    let clock:lolex.Clock;

    beforeEach(() => {
        clock = lolex.install();
        projection = new MockProjectionRunnerDefinition().define();
        notifications = [];
        stopped = false;
        failed = false;
        stream = TypeMoq.Mock.ofType<IStreamFactory>(MockStreamFactory);
        matcher = TypeMoq.Mock.ofType<IMatcher>(MockMatcher);
        readModelFactory = TypeMoq.Mock.ofType<IReadModelFactory>(MockReadModelFactory);
        subject = new ProjectionRunner<number>(projection, stream.object, matcher.object, readModelFactory.object, new MockStreamFactory(Observable.empty<Event>()),
            new MockDateRetriever(new Date(100000)));
        subscription = subject.notifications().subscribe((state: Event) => notifications.push(state.payload), e => failed = true, () => stopped = true);
    });

    afterEach(() => {
        subscription.dispose();
        clock.uninstall();
    });

    context("when initializing a projection", () => {
        beforeEach(() => {
            stream.setup(s => s.from(TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(_ => Observable.empty<Event>());
            matcher.setup(m => m.match(SpecialNames.Init)).returns(streamId => () => 42);
            readModelFactory.setup(r => r.from(TypeMoq.It.isAny())).returns(_ => Rx.Observable.empty<Event>());
        });

        context("if a snapshot is present", () => {
            beforeEach(() => {
                subject.run(new Snapshot(56, new Date(5000)));
            });

            it("should create an initial state based on snapshot memento", () => {
                expect(subject.state).to.be(56);
            });
            it("should subscribe to the event stream starting from the snapshot timestamp", () => {
                stream.verify(s => s.from(TypeMoq.It.isValue(new Date(5000)), TypeMoq.It.isAny(), TypeMoq.It.isAny()), TypeMoq.Times.once());
            });
        });

        context("if a snapshot is not present", () => {
            beforeEach(() => {
                subject.run();
            });

            it("should create an initial state based on the projection definition", () => {
                matcher.verify(m => m.match(SpecialNames.Init), TypeMoq.Times.once());
            });
            it("should subscribe to the event stream starting from the stream's beginning", () => {
                stream.verify(s => s.from(null, TypeMoq.It.isAny(), TypeMoq.It.isAny()), TypeMoq.Times.once());
            });

            it("should subscribe to the aggregates stream to build linked projections", () => {
                readModelFactory.verify(a => a.from(null), TypeMoq.Times.once());
            });

            context("should behave regularly", behavesRegularly);
        });

        function behavesRegularly() {
            it("should consider the initial state as the projection state", () => {
                expect(subject.state).to.be(42);
            });
            it("should notify that the projection has been initialized", () => {
                expect(notifications).to.eql([42]);
            });
        }
    });

    context("when receiving an event from a stream", () => {
        beforeEach(() => {
            matcher.setup(m => m.match(SpecialNames.Init)).returns(streamId => () => 42);
            readModelFactory.setup(r => r.from(TypeMoq.It.isAny())).returns(_ => Rx.Observable.empty<Event>());
        });

        it("it should filter out diagnostic events", () => {
            matcher.setup(m => m.match("__diagnostic:Size")).returns(streamId => (s: number, e: any) => s + e);
            stream.setup(s => s.from(null, TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(_ => Observable.just({
                type: "__diagnostic:Size",
                payload: 1,
                timestamp: new Date(),
                splitKey: null
            }).observeOn(Rx.Scheduler.immediate));
            subject.run();
            expect(notifications).to.be.eql([42]);
        });

        context("and no error occurs", () => {
            beforeEach(() => {
                let date = new Date();
                matcher.setup(m => m.match("increment")).returns(streamId => (s: number, e: any) => s + e);
                stream.setup(s => s.from(null, TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(_ => Observable.range(1, 5).map(n => {
                    return {type: "increment", payload: n, timestamp: new Date(+date + n), splitKey: null};
                }).observeOn(Rx.Scheduler.immediate));
                subject.run();
            });

            it("should match the event with the projection definition", () => {
                matcher.verify(m => m.match("increment"), TypeMoq.Times.exactly(5));
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
                readModelFactory.verify(a => a.publish(TypeMoq.It.isValue({
                    type: "test",
                    payload: 42 + 1 + 2 + 3 + 4 + 5,
                    timestamp: null,
                    splitKey: null
                })), TypeMoq.Times.atLeastOnce());
            });

        });

        context("and no match is found for this event", () => {
            beforeEach(() => {
                let date = new Date();
                stream.setup(s => s.from(null, TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(_ => Observable.range(1, 5).map(n => {
                    return {type: "increment" + n, payload: n, timestamp: new Date(+date + n), splitKey: null};
                }));
                matcher.setup(m => m.match("increment1")).returns(streamId => Rx.helpers.identity);
                matcher.setup(m => m.match("increment2")).returns(streamId => (s: number, e: any) => s + e);
                matcher.setup(m => m.match("increment3")).returns(streamId => (s: number, e: any) => s + e);
                matcher.setup(m => m.match("increment4")).returns(streamId => Rx.helpers.identity);
                matcher.setup(m => m.match("increment5")).returns(streamId => Rx.helpers.identity);
            });

            it("should not notify a state change", () => {
                subject.run();
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
                stream.setup(s => s.from(null, TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(_ => Observable.range(1, 5).map(n => {
                    return {type: "increment", payload: n, timestamp: new Date(), splitKey: null};
                }).observeOn(Rx.Scheduler.immediate));
            });
            it("should notify an error", () => {
                subject.run();
                expect(failed).to.be.ok();
            });
        });
    });

    context("when receiving a readmodel", () => {
        let readModelSubject = new Subject<any>();
        beforeEach(() => {
            matcher.setup(m => m.match(SpecialNames.Init)).returns(streamId => () => 42);
            readModelFactory.setup(s => s.from(null)).returns(_ => readModelSubject.observeOn(Scheduler.immediate));
            stream.setup(s => s.from(null, TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(_ => Observable.empty<Event>());
            subject.run();
        });
        context("of the same projection", () => {
            beforeEach(() => matcher.setup(m => m.match("test")).returns(streamId => (s: number, e: any) => s + e));
            it("should filter it", () => {
                readModelSubject.onNext({type: "test", payload: 1});
                expect(subject.state).to.be(42);
            });
        });

        context("of another projection", () => {
            beforeEach(() => matcher.setup(m => m.match("test2")).returns(streamId => (s: number, e: any) => s + e));
            it("should update the readmodels processed counter", () => {
                readModelSubject.onNext({type: "test2", payload: 1});
                expect(subject.stats.readModels).to.be(1);
            });
        });
    });

    context("when stopping a projection", () => {
        let streamSubject = new Subject<any>();
        beforeEach(() => {
            readModelFactory.setup(r => r.from(TypeMoq.It.isAny())).returns(_ => Rx.Observable.empty<Event>());
            matcher.setup(m => m.match(SpecialNames.Init)).returns(streamId => () => 42);
            matcher.setup(m => m.match("increment")).returns(streamId => (s: number, e: any) => s + e);
            stream.setup(s => s.from(null, TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(_ => streamSubject);

            subject.run();
            streamSubject.onNext({type: ReservedEvents.REALTIME, payload: null, timestamp: null});
            streamSubject.onNext({type: "increment", payload: 1, timestamp: new Date(501)});
            streamSubject.onNext({type: "increment", payload: 2, timestamp: new Date(502)});
            streamSubject.onNext({type: "increment", payload: 3, timestamp: new Date(503)});
            streamSubject.onNext({type: "increment", payload: 4, timestamp: new Date(504)});
            subject.stop();
            streamSubject.onNext({type: "increment", payload: 5, timestamp: new Date(505)});
        });
        it("should not process any more events", () => {
            expect(notifications).to.eql([
                42,
                42 + 1,
                42 + 1 + 2,
                42 + 1 + 2 + 3,
                42 + 1 + 2 + 3 + 4
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

    context("when pausing a projection", () => {
        let streamSubject = new Subject<any>();
        beforeEach(() => {
            readModelFactory.setup(r => r.from(TypeMoq.It.isAny())).returns(_ => Rx.Observable.empty<Event>());
            matcher.setup(m => m.match(SpecialNames.Init)).returns(streamId => () => 42);
            matcher.setup(m => m.match("increment")).returns(streamId => (s: number, e: any) => s + e);
            stream.setup(s => s.from(null, TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(_ => streamSubject);

            subject.run();
            streamSubject.onNext({type: ReservedEvents.REALTIME, payload: null, timestamp: null});
            streamSubject.onNext({type: "increment", payload: 1, timestamp: new Date(501)});
            streamSubject.onNext({type: "increment", payload: 2, timestamp: new Date(502)});
            subject.pause();
            streamSubject.onNext({type: "increment", payload: 3, timestamp: new Date(503)});
        });
        it("should not process events anymore", () => {
            expect(notifications).to.eql([
                42,
                42 + 1,
                42 + 1 + 2
            ]);
        });

        context("and the projection is resumed", () => {
            it("should start from the last state", () => {
                subject.resume();
                streamSubject.onNext({type: "increment", payload: 4, timestamp: new Date(504)});
                expect(notifications).to.eql([
                    42,
                    42 + 1,
                    42 + 1 + 2,
                    42 + 1 + 2 + 3,
                    42 + 1 + 2 + +3 + 4
                ]);
                expect(subject.state).to.be(42 + 1 + 2 + 3 + 4);
            });
        });

        context("and the projection is not runned", () => {
            it("should throw an error", () => {
                expect(() => subject.pause()).to.throwError();
            });
        });

    });

    context("when resuming a projection", () => {
        beforeEach( () => {
            subject.resume();
        });

        context("and the projection is not paused", () => {
            it("should throw an error", () => {
                expect(() => subject.resume()).to.throwError();
            });
        });

    });

});
