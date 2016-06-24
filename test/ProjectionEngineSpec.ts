/// <reference path="../node_modules/typemoq/typemoq.node.d.ts" />
import "bluebird";
import "reflect-metadata";
import expect = require("expect.js");
import sinon = require("sinon");
import IProjectionEngine from "../scripts/projections/IProjectionEngine";
import ProjectionEngine from "../scripts/projections/ProjectionEngine";
import IProjectionRegistry from "../scripts/registry/IProjectionRegistry";
import ProjectionRegistry from "../scripts/registry/ProjectionRegistry";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";
import PushNotifier from "../scripts/push/PushNotifier";
import IPushNotifier from "../scripts/push/IPushNotifier";
import {ProjectionAnalyzer} from "../scripts/projections/ProjectionAnalyzer";
import SinonSpy = Sinon.SinonSpy;
import MockObjectContainer from "./fixtures/MockObjectContainer";
import {Mock, Times, It} from "typemoq";
import IReadModelFactory from "../scripts/streams/IReadModelFactory";
import {IStreamFactory} from "../scripts/streams/IStreamFactory";
import {MockStreamFactory} from "./fixtures/MockStreamFactory";
import ReadModelFactory from "../scripts/streams/ReadModelFactory";
import Event from "../scripts/streams/Event";
import {Observable, Scheduler} from "rx";
import IProjectionSelector from "../scripts/projections/IProjectionSelector";
import ProjectionSelector from "../scripts/projections/ProjectionSelector";
import IProjectionRunner from "../scripts/projections/IProjectionRunner";
import {ProjectionRunner} from "../scripts/projections/ProjectionRunner";
import SinonStub = Sinon.SinonStub;

describe("Given a ProjectionEngine", () => {

    let subject:IProjectionEngine,
        registry:IProjectionRegistry,
        pushNotifier:Mock<IPushNotifier>,
        stream:Mock<IStreamFactory>,
        readModelFactory:Mock<IReadModelFactory>,
        projectionSelector:Mock<IProjectionSelector>,
        projectionRunner:Mock<IProjectionRunner<any>>,
        testEvent = {
            type: "increment",
            payload: 1
        };

    beforeEach(() => {
        projectionRunner = Mock.ofType<IProjectionRunner<any>>(ProjectionRunner);
        projectionRunner.setup(p => p.handle(It.isValue(testEvent))).returns(_ => null);
        pushNotifier = Mock.ofType<IPushNotifier>(PushNotifier);
        pushNotifier.setup(p => p.register(It.isValue(projectionRunner.object), It.isAny())).returns(_ => null);
        registry = new ProjectionRegistry(new ProjectionAnalyzer(), new MockObjectContainer());
        stream = Mock.ofType<IStreamFactory>(MockStreamFactory);
        readModelFactory = Mock.ofType<IReadModelFactory>(ReadModelFactory);
        readModelFactory.setup(r => r.from(null)).returns(_ => Observable.empty<Event>());
        projectionSelector = Mock.ofType<IProjectionSelector>(ProjectionSelector);
        projectionSelector.setup(p => p.projectionsFor(It.isValue(testEvent))).returns(_ => [projectionRunner.object]);
        stream.setup(s => s.from(null)).returns(_ => Observable.just(testEvent).observeOn(Scheduler.immediate));
        subject = new ProjectionEngine(pushNotifier.object, registry, stream.object, readModelFactory.object, projectionSelector.object);
        registry.add(MockProjectionDefinition).forArea("Admin");
    });

    describe("at startup", () => {
        beforeEach(() => subject.run());

        it("should subscribe to the event stream starting from the stream's beginning", () => {
            stream.verify(s => s.from(null), Times.once());
        });

        it("should subscribe to the aggregates stream to build linked projections", () => {
            readModelFactory.verify(a => a.from(null), Times.once());
        });
    });

    describe("when an event from the stream is received", () => {
        beforeEach(() => {
            subject.run();
        });

        it("should apply the event to all the matching projection runners", () => {
            projectionRunner.verify(p => p.handle(It.isValue(testEvent)), Times.once());
        });
    });
});
