import "reflect-metadata";
import ProjectionRunner from "../scripts/projections/ProjectionRunner";
import {SpecialNames} from "../scripts/matcher/SpecialNames";
import {IMatcher} from "../scripts/matcher/IMatcher";
import {IStreamFactory} from "../scripts/streams/IStreamFactory";
import {Observable, Subject, IDisposable, Scheduler, helpers} from "rx";
import {Mock, IMock, Times, It} from "typemoq";
import expect = require("expect.js");
import {Event} from "../scripts/streams/Event";
import MockDateRetriever from "./fixtures/MockDateRetriever";
import {SpecialStates} from "../scripts/projections/SpecialState";
import SplitProjectionRunner from "../scripts/projections/SplitProjectionRunner";
import IProjectionRunner from "../scripts/projections/IProjectionRunner";
import {Snapshot} from "../scripts/snapshots/ISnapshotRepository";
import IReadModelFactory from "../scripts/streams/IReadModelFactory";
import * as lolex from "lolex";
import * as _ from "lodash";
import Identity from "../scripts/matcher/Identity";

describe("Given a projection runner", () => {
    let stream: IMock<IStreamFactory>;
    let readModel: IMock<IReadModelFactory>;
    let subject: IProjectionRunner<number>;
    let matcher: IMock<IMatcher>;
    let notifications: number[];
    let stopped: boolean;
    let failed: boolean;
    let subscription: IDisposable;
    let clock: lolex.Clock;

    beforeEach(() => {
        clock = lolex.install();
        notifications = [];
        stopped = false;
        failed = false;
        stream = Mock.ofType<IStreamFactory>();
        readModel = Mock.ofType<IReadModelFactory>();
        matcher = Mock.ofType<IMatcher>();
        let date = new Date();
        stream.setup(s => s.from(null, It.isAny(), It.isAny())).returns(_ => Observable.range(1, 2).map(n => {
            return {type: "increment", payload: n, timestamp: new Date(+date + n), splitKey: null};
        }));
        matcher.setup(m => m.match(SpecialNames.Init)).returns(streamId => () => 42);
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

    context("when it's not a split projection", () => {
        beforeEach(() => {
            readModel.setup(r => r.from(null)).returns(a => Observable.empty<Event>());
            let tickScheduler = Mock.ofType<IStreamFactory>();
            tickScheduler.setup(t => t.from(null)).returns(() => Observable.empty<Event>());
            subject = new ProjectionRunner<number>({
                name: "test",
                definition: {}
            }, stream.object, matcher.object, readModel.object, tickScheduler.object, new MockDateRetriever(new Date(100000)), null);
            subscription = subject.notifications().subscribe((state: Event) => notifications.push(state.payload), e => failed = true, () => stopped = true);
        });

        context("and the state change should not be notified", () => {
            beforeEach(async() => {
                matcher.setup(m => m.match("increment")).returns(a => (s: number, e: any) => SpecialStates.stopSignalling(s + e));
                subject.run();
                await completeStream();
            });
            it("should not send a notification", () => {
                expect(notifications).to.eql([
                    42
                ]);
                expect(subject.state).to.be(42 + 1 + 2);
            });
        });
    });

    context("when it's a split projection", () => {
        let splitMatcher: IMock<IMatcher>;
        let readModelData: Subject<Event>;
        beforeEach(() => {
            readModelData = new Subject<Event>();
            readModel.setup(r => r.from(null)).returns(a => readModelData);
            splitMatcher = Mock.ofType<IMatcher>();
            let tickScheduler = Mock.ofType<IStreamFactory>();
            tickScheduler.setup(t => t.from(null)).returns(() => Observable.empty<Event>());
            subject = new SplitProjectionRunner<number>({
                name: "test",
                definition: {}
            }, stream.object, matcher.object, splitMatcher.object, readModel.object, tickScheduler.object, new MockDateRetriever(new Date(100000)), null);
            subscription = subject.notifications().subscribe((state: Event) => notifications.push(state.payload), e => failed = true, () => stopped = true);
        });

        context("and the state of a split should not be notified", () => {
            beforeEach(async() => {
                matcher.setup(m => m.match("increment")).returns(a => (s: number, e: any) => SpecialStates.stopSignalling(s + e));
                splitMatcher.setup(m => m.match("increment")).returns(a => (e: number) => e);
                subject.run();
                readModelData.onCompleted();
                await completeStream();
            });
            it("should not send a notification", () => {
                expect(notifications).to.eql([]);
                expect(subject.state["1"]).to.eql(42 + 1);
                expect(subject.state["2"]).to.eql(42 + 2);
            });
        });

        context("and a state change triggers the removal of a split", () => {
            beforeEach(() => {
                matcher.setup(m => m.match("increment")).returns(a => (s: number, e: any) => SpecialStates.deleteSplit());
                splitMatcher.setup(m => m.match("increment")).returns(a => (e: number) => e);
                matcher.setup(m => m.match("ReadModel")).returns(a => (s: number, e: any) => s + e);
                splitMatcher.setup(m => m.match("ReadModel")).returns(a => Identity);
                subject.run(new Snapshot(
                    subject.state = {
                        "1": 89,
                        "2": 293,
                        "3": 392
                    }, null));
            });
            it("should be removed from the dictionary", async() => {
                readModelData.onCompleted();
                await completeStream();

                expect(subject.state["1"]).to.be(undefined);
                expect(subject.state["2"]).to.be(undefined);
                expect(subject.state["3"]).to.be(392);
            });

            it("should also remove the key itself", async() => {
                readModelData.onCompleted();
                await completeStream();

                expect(_.has(subject.state, "2")).to.be(false);
            });

            it("should not receive readmodels anymore", async() => {
                readModelData.onNext({type: "ReadModel", payload: 5000, splitKey: null, timestamp: null});
                readModelData.onCompleted();
                await completeStream();
                
                expect(subject.state["1"]).to.be(undefined);
                expect(subject.state["2"]).to.be(undefined);
                expect(subject.state["3"]).to.be(5392);
            });
        });
    });
});
