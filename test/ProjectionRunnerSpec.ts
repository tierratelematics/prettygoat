/// <reference path="../node_modules/typemoq/typemoq.node.d.ts" />
import "bluebird";
import "reflect-metadata";
import {ProjectionRunner} from "../scripts/projections/ProjectionRunner";
import {SpecialNames} from "../scripts/matcher/SpecialNames";
import {IMatcher} from "../scripts/matcher/IMatcher";
import {ISnapshotRepository, Snapshot} from "../scripts/snapshots/ISnapshotRepository";
import {IStreamFactory} from "../scripts/streams/IStreamFactory";
import {MockMatcher} from "./fixtures/MockMatcher";
import {MockSnapshotRepository} from "./fixtures/MockSnapshotRepository";
import {MockStreamFactory} from "./fixtures/MockStreamFactory";
import {Observable, Subject, IDisposable} from "rx";
import {Mock, Times, It} from "typemoq";
import expect = require("expect.js");
import * as Rx from "rx";
import IReadModelFactory from "../scripts/streams/IReadModelFactory";
import ReadModelFactory from "../scripts/streams/ReadModelFactory";
import Event from "../scripts/streams/Event";
import NotificationState from "../scripts/push/NotificationState";

describe("Given a ProjectionRunner", () => {
    let subject:ProjectionRunner<number>;
    let matcher:Mock<IMatcher>;
    let notifications:number[];
    let stopped:boolean;
    let failed:boolean;
    let subscription:IDisposable;
    let readModelFactory:Mock<IReadModelFactory>;

    beforeEach(() => {
        notifications = [];
        stopped = false;
        failed = false;
        matcher = Mock.ofType<IMatcher>(MockMatcher);
        readModelFactory = Mock.ofType<IReadModelFactory>(ReadModelFactory);
        readModelFactory.setup(r => r.from(null)).returns(_ => Rx.Observable.empty<Event>());
        subject = new ProjectionRunner<number>("test", matcher.object, readModelFactory.object);
        subscription = subject.subscribe((state:NotificationState<number>) => notifications.push(state.state), e => failed = true, () => stopped = true);
    });

    afterEach(() => subscription.dispose());

    context("when initializing a projection", () => {

        context("and a snapshot is present", () => {
            beforeEach(() => {
                matcher.setup(m => m.match(SpecialNames.Init)).throws(new Error("match called for $init when a snapshot was present"));
                subject.initializeWith(42);
            });

            context("should behave regularly", behavesRegularly);
        });

        context("and a snapshot is not present", () => {
            beforeEach(() => {
                matcher.setup(m => m.match(SpecialNames.Init)).returns(streamId => () => 42);
                subject.initializeWith(null);
            });

            it("should create an initial state based on the projection definition", () => {
                matcher.verify(m => m.match(SpecialNames.Init), Times.once());
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

    context("when a new event is applied", () => {

        beforeEach(() => {
            matcher.setup(m => m.match(SpecialNames.Init)).returns(streamId => () => 42);
        });


        context("and no error occurs", () => {
            beforeEach(() => {
                matcher.setup(m => m.match("increment")).returns(streamId => (s:number, e:any) => s + e);
                subject.initializeWith(null);
                subject.handle({type: "increment", payload: 1});
                subject.handle({type: "increment", payload: 2});
                subject.handle({type: "increment", payload: 3});
                subject.handle({type: "increment", payload: 4});
                subject.handle({type: "increment", payload: 5});
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

            it("should publish on the event stream the new read models states", () => {
                readModelFactory.verify(a => a.publish(It.isValue({
                    type: "test",
                    payload: 42
                })), Times.atLeastOnce());
            });
        });

        context("and an error occurs while processing the event", () => {
            beforeEach(() => {
                matcher.setup(m => m.match("increment")).returns(f => (s:number, e:any) => {
                    throw new Error("Kaboom!");
                });
                subject.initializeWith(null);
                subject.handle(null);
            });
            it("should notify an error", () => {
                expect(failed).to.be.ok();
            });
        });

    });
});
