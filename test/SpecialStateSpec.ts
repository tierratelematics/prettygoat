import "reflect-metadata";
import ProjectionRunner from "../scripts/projections/ProjectionRunner";
import {SpecialNames} from "../scripts/matcher/SpecialNames";
import {IMatcher} from "../scripts/matcher/IMatcher";
import {Observable, Subject, IDisposable, Scheduler, helpers} from "rx";
import {Mock, IMock, Times, It} from "typemoq";
import expect = require("expect.js");
import {Event} from "../scripts/streams/Event";
import {SpecialStates} from "../scripts/projections/SpecialState";
import SplitProjectionRunner from "../scripts/projections/SplitProjectionRunner";
import {IProjectionRunner, RunnerNotification} from "../scripts/projections/IProjectionRunner";
import {Snapshot} from "../scripts/snapshots/ISnapshotRepository";
import IReadModelFactory from "../scripts/streams/IReadModelFactory";
import * as lolex from "lolex";
import * as _ from "lodash";
import {IProjectionStreamGenerator} from "../scripts/projections/ProjectionStreamGenerator";
import Identity from "../scripts/matcher/Identity";

describe("Given a projection runner", () => {
    let stream: IMock<IProjectionStreamGenerator>;
    let readModel: IMock<IReadModelFactory>;
    let subject: IProjectionRunner<number>;
    let matcher: IMock<IMatcher>;
    let notificationMatcher: IMock<IMatcher>;
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
        stream = Mock.ofType<IProjectionStreamGenerator>();
        readModel = Mock.ofType<IReadModelFactory>();
        matcher = Mock.ofType<IMatcher>();
        notificationMatcher = Mock.ofType<IMatcher>();
        let date = new Date();
        stream.setup(s => s.generate(It.isAny(), It.isAny(), It.isAny())).returns(_ => Observable.range(1, 2).map(n => {
            return {type: "increment", payload: n, timestamp: new Date(+date + n), splitKey: null};
        }));
        matcher.setup(m => m.match(SpecialNames.Init)).returns(streamId => () => 42);
        notificationMatcher.setup(m => m.match(It.isAny())).returns(() => Identity);
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
            subject = new ProjectionRunner<number>({
                name: "test",
                definition: {}
            }, stream.object, matcher.object, notificationMatcher.object, readModel.object);
            subscription = subject.notifications().subscribe((notification: RunnerNotification<any>) => notifications.push(notification[0].payload), e => failed = true, () => stopped = true);
        });

        context("and the state change should not be notified", () => {
            beforeEach(async () => {
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
        beforeEach(() => {
            splitMatcher = Mock.ofType<IMatcher>();
            subject = new SplitProjectionRunner<number>({
                name: "test",
                definition: {}
            }, stream.object, matcher.object, splitMatcher.object, readModel.object);
            subscription = subject.notifications().subscribe((state: Event) => notifications.push(state.payload), e => failed = true, () => stopped = true);
        });

        context("and the state of a split should not be notified", () => {
            beforeEach(async () => {
                matcher.setup(m => m.match("increment")).returns(a => (s: number, e: any) => SpecialStates.stopSignalling(s + e));
                splitMatcher.setup(m => m.match("increment")).returns(a => (e: number) => e);
                subject.run();
                await completeStream();
            });
            it("should not send a notification", () => {
                expect(notifications).to.eql([]);
                expect(subject.state["1"]).to.eql(42 + 1);
                expect(subject.state["2"]).to.eql(42 + 2);
            });
        });

        context("and a state change triggers the removal of a split", () => {
            beforeEach(async () => {
                matcher.setup(m => m.match("increment")).returns(a => (s: number, e: any) => SpecialStates.deleteSplit());
                splitMatcher.setup(m => m.match("increment")).returns(a => (e: number) => e);
                subject.run(new Snapshot(
                    subject.state = {
                        "1": 89,
                        "2": 293,
                        "3": 392
                    }, null));

                await completeStream();
            });
            it("should be removed from the dictionary", () => {
                expect(subject.state["1"]).to.be(undefined);
                expect(subject.state["2"]).to.be(undefined);
                expect(subject.state["3"]).to.be(392);
            });

            it("should also remove the key itself", () => {
                expect(_.has(subject.state, "2")).to.be(false);
            });
        });
    });
});
