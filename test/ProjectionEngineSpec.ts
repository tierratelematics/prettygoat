/// <reference path="../node_modules/typemoq/typemoq.node.d.ts" />
import "bluebird";
import "reflect-metadata";
import expect = require("expect.js");
import sinon = require("sinon");
import IProjectionEngine from "../scripts/projections/IProjectionEngine";
import ProjectionEngine from "../scripts/projections/ProjectionEngine";
import IProjectionRegistry from "../scripts/registry/IProjectionRegistry";
import SinonStub = Sinon.SinonStub;
import ProjectionRegistry from "../scripts/registry/ProjectionRegistry";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";
import PushNotifier from "../scripts/push/PushNotifier";
import IPushNotifier from "../scripts/push/IPushNotifier";
import {ProjectionAnalyzer} from "../scripts/projections/ProjectionAnalyzer";
import SinonSpy = Sinon.SinonSpy;
import MockObjectContainer from "./fixtures/MockObjectContainer";
import {Mock, Times} from "typemoq";
import IReadModelFactory from "../scripts/streams/IReadModelFactory";
import {IStreamFactory} from "../scripts/streams/IStreamFactory";
import {MockStreamFactory} from "./fixtures/MockStreamFactory";
import ReadModelFactory from "../scripts/streams/ReadModelFactory";
import Event from "../scripts/streams/Event";
import {Observable, Scheduler} from "rx";

describe("Given a ProjectionEngine", () => {

    let subject:IProjectionEngine,
        registry:IProjectionRegistry,
        pushNotifier:IPushNotifier,
        notifyStub:SinonStub,
        stream:Mock<IStreamFactory>,
        readModelFactory:Mock<IReadModelFactory>;

    beforeEach(() => {
        pushNotifier = new PushNotifier(null, null, null, {host: 'test', protocol: 'http', port: 80});
        registry = new ProjectionRegistry(new ProjectionAnalyzer(), new MockObjectContainer());
        stream = Mock.ofType<IStreamFactory>(MockStreamFactory);
        readModelFactory = Mock.ofType<IReadModelFactory>(ReadModelFactory);
        readModelFactory.setup(r => r.from(null)).returns(_ => Observable.empty<Event>());
        subject = new ProjectionEngine(pushNotifier, registry, stream.object, readModelFactory.object);
        notifyStub = sinon.stub(pushNotifier, "register", () => {
        });
        stream.setup(s => s.from(null)).returns(_ => Observable.just({
            type: "increment",
            payload: 1
        }).observeOn(Scheduler.immediate));
    });

    afterEach(() => {
        notifyStub.restore();
    });

    it("should subscribe to the event stream starting from the stream's beginning", () => {
        subject.run();
        stream.verify(s => s.from(null), Times.once());
    });

    it("should subscribe to the aggregates stream to build linked projections", () => {
        subject.run();
        readModelFactory.verify(a => a.from(null), Times.once());
    });

    describe("when running", () => {

        it("should run all the registered projections", () => {
            registry.add(MockProjectionDefinition).forArea("Admin");
            subject.run();
            //TODO: test projection selector to be called
        });

        context("and an event from the stream is received", () => {
            beforeEach(() => {

            });
            it("should apply these event to all the matching projection runners", () => {
                // stream.setup(s => s.from(undefined)).returns(_ => Observable.range(1, 5).map(n => { return { type: "increment", payload: n }; }).observeOn(Rx.Scheduler.immediate));
            });
        });
    });
});
