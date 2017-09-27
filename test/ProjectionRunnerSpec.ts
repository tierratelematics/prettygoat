import "reflect-metadata";
import {Observable, Subject, Subscription} from "rxjs";
import {IMock, Mock, Times, It} from "typemoq";
import expect = require("expect.js");
import {Event} from "../scripts/events/Event";
import {Snapshot} from "../scripts/snapshots/ISnapshotRepository";
import {IProjection} from "../scripts/projections/IProjection";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";
import {IProjectionStreamGenerator} from "../scripts/projections/ProjectionStreamGenerator";
import {IMatcher} from "../scripts/projections/Matcher";
import SpecialEvents from "../scripts/events/SpecialEvents";
import {ProjectionRunner} from "../scripts/projections/ProjectionRunner";
import Dictionary from "../scripts/common/Dictionary";
import {isArray} from "lodash";

describe("Given a ProjectionRunner", () => {
    let streamGenerator: IMock<IProjectionStreamGenerator>;
    let subject: ProjectionRunner<number>;
    let matcher: IMock<IMatcher>;
    let notifications: number[];
    let timestamps: Date[];
    let stopped: boolean;
    let failed: boolean;
    let subscription: Subscription;
    let projection: IProjection<number>;
    let notificationKeys: Dictionary<string[]>;
    let lastId: string;

    beforeEach(() => {
        projection = new MockProjectionDefinition().define();
        notifications = [];
        timestamps = [];
        stopped = false;
        failed = false;
        streamGenerator = Mock.ofType<IProjectionStreamGenerator>();
        matcher = Mock.ofType<IMatcher>();
        let detailMatcher = Mock.ofType<IMatcher>();
        detailMatcher.setup(d => d.match("increment")).returns(() => (s, e) => e.toString());
        let testMatcher = Mock.ofType<IMatcher>();
        testMatcher.setup(d => d.match(It.isAny())).returns(() => null);
        subject = new ProjectionRunner<number>(projection, streamGenerator.object, matcher.object, {
            "Test": testMatcher.object, "Detail": detailMatcher.object
        });
        subscription = subject.notifications().subscribe(notification => {
            notifications.push(notification[0].payload);
            timestamps.push(notification[0].timestamp);
            notificationKeys = notification[1];
            lastId = notification[0].id;
        }, e => failed = true, () => stopped = true);
    });

    afterEach(() => {
        subscription.unsubscribe();
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

            it("should notify the main channel of every publish point", () => {
                expect(notificationKeys).to.eql({
                    "Test": [null],
                    "Detail": [null]
                });
            });
        });

        context("if a snapshot is not present", () => {
            beforeEach(async () => {
                subject.run();
                await completeStream();
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
                expect(timestamps[0]).to.eql(new Date(0));
            });
        });
    });

    context("when the projection has gone realtime", () => {
        beforeEach(async () => {
            streamGenerator.setup(s => s.generate(It.isAny(), It.isAny(), It.isAny())).returns(_ => Observable.of({
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
                    return {type: "increment", payload: n, timestamp: new Date(+date + n), id: "unique-" + n};
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
                    expect(subject.stats.events).to.be(6);
                });

                it("should set the latest timestamp", () => {
                    expect(subject.stats.lastEvent).to.eql(new Date(5005));
                });

                it("should produce the correct notification keys", () => {
                    expect(notificationKeys).to.eql({
                        "Test": [null],
                        "Detail": ["5"]
                    });
                    expect(isArray(notificationKeys.Detail)).to.be(true);
                });

                it("should set the id of the last event", () => {
                    expect(lastId).to.be("unique-5");
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

        context("and an error occurs while processing the event", () => {
            beforeEach(() => {
                matcher.setup(m => m.match("increment")).returns(streamId => (s: number, e: any) => {
                    throw new Error("Kaboom!");
                });
                streamGenerator.setup(s => s.generate(It.isAny(), It.isAny(), It.isAny())).returns(_ => Observable.range(1, 5).map(n => {
                    return {type: "increment", payload: n, timestamp: new Date()};
                }));
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
            streamSubject.next({type: "increment", payload: 1, timestamp: new Date(501)});
            streamSubject.next({type: "increment", payload: 2, timestamp: new Date(502)});
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
