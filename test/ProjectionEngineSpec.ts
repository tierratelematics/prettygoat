import "bluebird";
import "reflect-metadata";
import expect = require("expect.js");
import IProjectionEngine from "../scripts/projections/IProjectionEngine";
import ProjectionEngine from "../scripts/projections/ProjectionEngine";
import IProjectionRegistry from "../scripts/registry/IProjectionRegistry";
import ProjectionRegistry from "../scripts/registry/ProjectionRegistry";
import ProjectionRunnerFactory from "../scripts/projections/ProjectionRunnerFactory";
import PushNotifier from "../scripts/push/PushNotifier";
import IProjectionRunner from "../scripts/projections/IProjectionRunner";
import IPushNotifier from "../scripts/push/IPushNotifier";
import {Subject, Observable, Scheduler} from "rx";
import IProjectionRunnerFactory from "../scripts/projections/IProjectionRunnerFactory";
import MockModel from "./fixtures/MockModel";
import MockStatePublisher from "./fixtures/MockStatePublisher";
import {Event} from "../scripts/streams/Event";
import * as TypeMoq from "typemoq";
import {ISnapshotRepository, Snapshot} from "../scripts/snapshots/ISnapshotRepository";
import MockSnapshotRepository from "./fixtures/MockSnapshotRepository";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";
import {ISnapshotStrategy} from "../scripts/snapshots/ISnapshotStrategy";
import CountSnapshotStrategy from "../scripts/snapshots/CountSnapshotStrategy";
import AreaRegistry from "../scripts/registry/AreaRegistry";
import RegistryEntry from "../scripts/registry/RegistryEntry";
import Dictionary from "../scripts/Dictionary";
import {MockStreamFactory} from "./fixtures/MockStreamFactory";
import {IProjection} from "../scripts/projections/IProjection";
import MockReadModelFactory from "./fixtures/MockReadModelFactory";
import {ProjectionRunner} from "../scripts/projections/ProjectionRunner";
import {Matcher} from "../scripts/matcher/Matcher";

describe("Given a ProjectionEngine", () => {

    let subject:IProjectionEngine,
        registry:TypeMoq.Mock<IProjectionRegistry>,
        pushNotifier:TypeMoq.Mock<IPushNotifier>,
        snapshotStrategy:TypeMoq.Mock<ISnapshotStrategy>,
        runner:IProjectionRunner<number>,
        runnerFactory:TypeMoq.Mock<IProjectionRunnerFactory>,
        snapshotRepository:TypeMoq.Mock<ISnapshotRepository>,
        dataSubject:Subject<Event>,
        projection:IProjection<number>;

    beforeEach(() => {
        snapshotStrategy = TypeMoq.Mock.ofType(CountSnapshotStrategy);
        projection = new MockProjectionDefinition(snapshotStrategy.object).define();
        dataSubject = new Subject<Event>();
        runner = new ProjectionRunner<number>(projection, new MockStreamFactory(dataSubject), new Matcher(projection.definition),
            new MockReadModelFactory(), new MockStreamFactory(Observable.empty<Event>()));
        pushNotifier = TypeMoq.Mock.ofType(PushNotifier);
        pushNotifier.setup(p => p.notify(TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(a => null);
        runnerFactory = TypeMoq.Mock.ofType(ProjectionRunnerFactory);
        runnerFactory.setup(r => r.create(TypeMoq.It.isAny())).returns(a => runner);
        registry = TypeMoq.Mock.ofType(ProjectionRegistry);
        registry.setup(r => r.getAreas()).returns(a => {
            return [
                new AreaRegistry("Admin", [
                    new RegistryEntry(projection, "Mock")
                ])
            ]
        });
        snapshotRepository = TypeMoq.Mock.ofType(MockSnapshotRepository);
        snapshotRepository.setup(s => s.saveSnapshot("test", TypeMoq.It.isValue(new Snapshot(66, new Date(5000))))).returns(a => null);
        snapshotRepository.setup(s => s.initialize()).returns(a => Observable.just(null));
        subject = new ProjectionEngine(runnerFactory.object, pushNotifier.object, registry.object, new MockStatePublisher(), snapshotRepository.object);
    });

    context("when a snapshot is present", () => {
        beforeEach(() => {
            snapshotRepository.setup(s => s.getSnapshots()).returns(a => Observable.just<Dictionary<Snapshot<any>>>({
                "test": new Snapshot(42, new Date(5000))
            }).observeOn(Scheduler.immediate));
            subject.run();
        });

        it("should init a projection runner with that snapshot", () => {
            expect(runner.state).to.be(42);
        });
    });

    context("when a snapshot is not present", () => {
        beforeEach(() => {
            snapshotRepository.setup(s => s.getSnapshots()).returns(a => Observable.just<Dictionary<Snapshot<any>>>({}).observeOn(Scheduler.immediate));
            subject.run();
        });
        it("should init a projection runner without a snapshot", () => {
            expect(runner.state).to.be(10);
        });
    });

    context("when a projections triggers a new state", () => {
        beforeEach(() => {
            snapshotRepository.setup(s => s.getSnapshots()).returns(a => Observable.just<Dictionary<Snapshot<any>>>({}).observeOn(Scheduler.immediate));
        });
        context("and a snapshot is needed", () => {
            beforeEach(() => {
                snapshotStrategy.setup(s => s.needsSnapshot(TypeMoq.It.isValue({
                    type: "test",
                    payload: 66,
                    timestamp: new Date(5000),
                    splitKey: null
                }))).returns(a => true);
                subject.run();
                dataSubject.onNext({
                    type: "TestEvent",
                    payload: 56,
                    timestamp: new Date(5000),
                    splitKey: null
                });
            });
            it("should save the snapshot", (done) => {
                setTimeout(() => {
                    snapshotRepository.verify(s => s.saveSnapshot("test", TypeMoq.It.isValue(new Snapshot(66, new Date(5000)))), TypeMoq.Times.once());
                    done();
                }, 500);
            });
        });

        context("and a snapshot is not needed", () => {
            beforeEach(() => {
                snapshotStrategy.setup(s => s.needsSnapshot(TypeMoq.It.isValue({
                    type: "test",
                    payload: 66,
                    timestamp: new Date(5000),
                    splitKey: null
                }))).returns(a => false);
                subject.run();
                dataSubject.onNext({
                    type: "TestEvent",
                    payload: 56,
                    timestamp: new Date(5000),
                    splitKey: null
                });
            });
            it("should not save the snapshot", () => {
                snapshotRepository.verify(s => s.saveSnapshot("test", TypeMoq.It.isValue(new Snapshot(66, new Date(5000)))), TypeMoq.Times.never());
            });
        });
    });
});
