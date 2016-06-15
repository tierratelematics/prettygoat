import expect = require("expect.js");
import sinon = require("sinon");
import {SplitProjectionRunner} from "../scripts/projections/SplitProjectionRunner";
import SplitProjectionDefinition from "./fixtures/definitions/SplitProjectionDefinition";
import {Matcher} from "../scripts/matcher/Matcher";
import {IProjection} from "../scripts/projections/IProjection";
import * as Rx from "rx";
import {MockStreamFactory} from "./fixtures/MockStreamFactory";
import {MockSnapshotRepository} from "./fixtures/MockSnapshotRepository";
import IReadModelFactory from "../scripts/streams/IReadModelFactory";
import MockReadModelFactory from "./fixtures/MockReadModelFactory";

describe("Split projection, given a projection with a split definition", () => {

    let subject:SplitProjectionRunner<number>,
        projection:IProjection<number>,
        eventSubject:Rx.Subject<any>,
        readModelFactory:IReadModelFactory;

    beforeEach(() => {
        eventSubject = new Rx.Subject<any>();
        projection = new SplitProjectionDefinition().define();
        readModelFactory = new MockReadModelFactory();
        subject = new SplitProjectionRunner<number>(projection,
            new MockStreamFactory(eventSubject),
            new MockSnapshotRepository(),
            new Matcher(projection.definition),
            readModelFactory);
    });

    context("when a new event is emitted", () => {
        context("and a projection runner has not been created yet", () => {

            it("should subscribe to the read model stream", () => {
                readModelFactory.publish({
                    type: 'LinkedState',
                    payload: {
                        count2: 2000
                    }
                });
                subject.run();
                eventSubject.onNext({
                    type: "TestEvent",
                    payload: {
                        id: "20f8",
                        count: 20
                    }
                });
                expect(subject.runnerFor("20f8").state).to.be(2030);
            });

            it("should receive only the last read model for every projection", () => {
                readModelFactory.publish({
                    type: 'LinkedState',
                    payload: {
                        count2: 2000
                    }
                });
                readModelFactory.publish({
                    type: 'LinkedState',
                    payload: {
                        count2: 2000
                    }
                });
                subject.run();
                eventSubject.onNext({
                    type: "TestEvent",
                    payload: {
                        id: "20f8",
                        count: 20
                    }
                });
                expect(subject.runnerFor("20f8").state).to.be(2030);
            });

            it("should add a projection runner to the list of runners with the result key", () => {
                subject.run();
                eventSubject.onNext({
                    type: "TestEvent",
                    payload: {
                        id: "20f8",
                        count: 20
                    }
                });
                expect(subject.runnerFor("20f8").state).to.be(30);
            });
        });

        context("and a projection runner has already been created", () => {
            it("should calculate the new state of the projection", () => {
                subject.run();
                eventSubject.onNext({
                    type: "TestEvent",
                    payload: {
                        id: "20f8",
                        count: 20
                    }
                });
                eventSubject.onNext({
                    type: "TestEvent",
                    payload: {
                        id: "20f8",
                        count: 20
                    }
                });
                expect(subject.runnerFor("20f8").state).to.be(50);
            });
        });
    });

    context("when it's running and needs to be stopped", () => {
        it("should stop all the registered projections");
    });
});