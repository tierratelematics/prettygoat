import "bluebird";
import "reflect-metadata";
import {ProjectionRunner} from "../scripts/projections/ProjectionRunner";
import {SpecialNames} from "../scripts/matcher/SpecialNames";
import {IMatcher} from "../scripts/matcher/IMatcher";
import {IStreamFactory} from "../scripts/streams/IStreamFactory";
import {MockMatcher} from "./fixtures/MockMatcher";
import {MockStreamFactory} from "./fixtures/MockStreamFactory";
import {Observable, Subject, IDisposable} from "rx";
import * as TypeMoq from "typemoq";
import expect = require("expect.js");
import * as Rx from "rx";
import {Event} from "../scripts/streams/Event";
import MockDateRetriever from "./fixtures/MockDateRetriever";
import {SpecialStates} from "../scripts/projections/SpecialState";
import MockReadModelFactory from "./fixtures/MockReadModelFactory";
import SplitProjectionRunner from "../scripts/projections/SplitProjectionRunner";
import IProjectionRunner from "../scripts/projections/IProjectionRunner";

describe("Given a a projection runner", () => {
    let stream:TypeMoq.Mock<IStreamFactory>;
    let subject:IProjectionRunner<number>;
    let matcher:TypeMoq.Mock<IMatcher>;
    let notifications:number[];
    let stopped:boolean;
    let failed:boolean;
    let subscription:IDisposable;

    beforeEach(() => {
        notifications = [];
        stopped = false;
        failed = false;
        stream = TypeMoq.Mock.ofType<IStreamFactory>(MockStreamFactory);
        matcher = TypeMoq.Mock.ofType<IMatcher>(MockMatcher);
        let date = new Date();
        stream.setup(s => s.from(null, TypeMoq.It.isAny())).returns(_ => Observable.range(1, 2).map(n => {
            return {type: "increment", payload: n, timestamp: new Date(+date + n), splitKey: null};
        }).observeOn(Rx.Scheduler.immediate));
        matcher.setup(m => m.match(SpecialNames.Init)).returns(streamId => () => 42);
    });

    afterEach(() => subscription.dispose());

    context("when it's not a split projection", () => {
        beforeEach(() => {
            subject = new ProjectionRunner<number>({
                    name: "test",
                    definition: {}
                }, stream.object, matcher.object, new MockReadModelFactory(), new MockStreamFactory(Observable.empty<Event>()),
                new MockDateRetriever(new Date(100000)));
            subscription = subject.notifications().subscribe((state:Event) => notifications.push(state.payload), e => failed = true, () => stopped = true);
        });

        context("and the state change should not be notified", () => {
            beforeEach(() => {
                matcher.setup(m => m.match("increment")).returns(a => (s:number, e:any) => SpecialStates.stopSignalling(s + e));
                subject.run();
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
        let splitMatcher:TypeMoq.Mock<IMatcher>;
        beforeEach(() => {
            splitMatcher = TypeMoq.Mock.ofType(MockMatcher);
            subject = new SplitProjectionRunner<number>({
                name: "test",
                definition: {}
            }, stream.object, matcher.object, splitMatcher.object, new MockReadModelFactory(), new MockStreamFactory(Observable.empty<Event>()),
                new MockDateRetriever(new Date(100000)));
            subscription = subject.notifications().subscribe((state:Event) => notifications.push(state.payload), e => failed = true, () => stopped = true);
        });

        context("and the state of a split should not be notified", () => {
            beforeEach(() => {
                matcher.setup(m => m.match("increment")).returns(a => (s:number, e:any) => SpecialStates.stopSignalling(s + e));
                splitMatcher.setup(m => m.match("increment")).returns(a => (e:number) => e);
                subject.run();
            });
            it("should not send a notification", () => {
                expect(notifications).to.eql([]);
                expect(subject.state["1"]).to.eql(42 + 1);
                expect(subject.state["2"]).to.eql(42 + 2);
            });
        });
    });
});
