/// <reference path="../node_modules/typemoq/typemoq.node.d.ts" />
import expect = require("expect.js");
import sinon = require("sinon");
import {Mock, Times, It} from "typemoq";
import SplitProjectionRunner from "../scripts/projections/SplitProjectionRunner";
import {Observable, Scheduler, ReplaySubject, IDisposable, Subject} from "rx";
import {IStreamFactory} from "../scripts/streams/IStreamFactory";
import IReadModelFactory from "../scripts/streams/IReadModelFactory";
import {MockStreamFactory} from "./fixtures/MockStreamFactory";
import ReadModelFactory from "../scripts/streams/ReadModelFactory";
import SplitProjectionDefinition from "./fixtures/definitions/SplitProjectionDefinition";
import {Matcher} from "../scripts/matcher/Matcher";
import Event from "../scripts/streams/Event";

describe("Split projection, given a projection with a split definition", () => {

    let subject:SplitProjectionRunner<number>;
    let stream:Mock<IStreamFactory>;
    let notifications:Event[];
    let stopped:boolean;
    let failed:boolean;
    let subscription:IDisposable;
    let readModelFactory:Mock<IReadModelFactory>;
    let streamData:Subject<Event>;
    let readModelData:Subject<Event>;
    let projection = new SplitProjectionDefinition().define();

    beforeEach(() => {
        notifications = [];
        stopped = false;
        failed = false;
        streamData = new ReplaySubject<Event>();
        readModelData = new ReplaySubject<Event>();
        stream = Mock.ofType<IStreamFactory>(MockStreamFactory);
        readModelFactory = Mock.ofType<IReadModelFactory>(ReadModelFactory);
        subject = new SplitProjectionRunner<number>(projection.name, stream.object, new Matcher(projection.definition),
            new Matcher(projection.split), readModelFactory.object);
        subscription = subject.subscribe((event:Event) => notifications.push(event), e => failed = true, () => stopped = true);
        readModelFactory.setup(r => r.from(null)).returns(_ => Observable.empty<Event>());
    });

    context("when a new event is received", () => {
        beforeEach(() => {
            stream.setup(s => s.from(null)).returns(_ => streamData.observeOn(Scheduler.immediate));
            streamData.onNext({
                type: "TestEvent",
                payload: {
                    count: 20,
                    id: "10"
                }
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
                    }
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
                    }
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
                    }
                });
            });

            it("should dispatch the read model to all the projections", () => {
                subject.run();
                expect(subject.state["10"]).to.be(5030);
            });

            it("should notify the changesof the states", () => {
                subject.run();
                expect(notifications).to.have.length(2);
                expect(notifications[1].payload).to.be(5030);
                expect(notifications[1].splitKey).to.be("10");
            });
        });
    });
});