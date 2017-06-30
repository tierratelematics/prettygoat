import "reflect-metadata";
import expect = require("expect.js");
import IProjectionEngine from "../scripts/projections/IProjectionEngine";
import ProjectionEngine from "../scripts/projections/ProjectionEngine";
import {IProjectionRunner} from "../scripts/projections/IProjectionRunner";
import {Subject, Observable, Scheduler} from "rx";
import IProjectionRunnerFactory from "../scripts/projections/IProjectionRunnerFactory";
import {Event} from "../scripts/events/Event";
import {IMock, Mock, Times, It} from "typemoq";
import {ISnapshotRepository, Snapshot} from "../scripts/snapshots/ISnapshotRepository";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";
import {ISnapshotStrategy} from "../scripts/snapshots/ISnapshotStrategy";
import {IProjection} from "../scripts/projections/IProjection";
import NullLogger from "../scripts/log/NullLogger";
import * as lolex from "lolex";
import MockProjectionRunner from "./fixtures/MockProjectionRunner";
import {IPushNotifier} from "../scripts/push/IPushComponents";
import IAsyncPublisher from "../scripts/util/IAsyncPublisher";
import PushContext from "../scripts/push/PushContext";
import {IProjectionRegistry} from "../scripts/bootstrap/ProjectionRegistry";

describe("Given a ProjectionEngine", () => {

    let subject: IProjectionEngine,
        registry: IMock<IProjectionRegistry>,
        pushNotifier: IMock<IPushNotifier>,
        snapshotStrategy: IMock<ISnapshotStrategy>,
        runner: IMock<IProjectionRunner<number>>,
        runnerFactory: IMock<IProjectionRunnerFactory>,
        snapshotRepository: IMock<ISnapshotRepository>,
        dataSubject: Subject<Event>,
        projection: IProjection<number>,
        asyncPublisher: IMock<IAsyncPublisher<any>>,
        clock: lolex.Clock;

    beforeEach(() => {
        clock = lolex.install();
        asyncPublisher = Mock.ofType<IAsyncPublisher<any>>();
        asyncPublisher.setup(a => a.items()).returns(() => Observable.empty());
        snapshotStrategy = Mock.ofType<ISnapshotStrategy>();
        projection = new MockProjectionDefinition(snapshotStrategy.object).define();
        dataSubject = new Subject<Event>();
        runner = Mock.ofType(MockProjectionRunner);
        runner.setup(r => r.notifications()).returns(a => dataSubject);
        pushNotifier = Mock.ofType<IPushNotifier>();
        runnerFactory = Mock.ofType<IProjectionRunnerFactory>();
        runnerFactory.setup(r => r.create(It.isAny())).returns(a => runner.object);
        registry = Mock.ofType<IProjectionRegistry>();
        registry.setup(r => r.projections()).returns(() => [["Admin", projection]]);
        snapshotRepository = Mock.ofType<ISnapshotRepository>();
        subject = new ProjectionEngine(runnerFactory.object, pushNotifier.object, registry.object, snapshotRepository.object,
            NullLogger, asyncPublisher.object);
    });

    afterEach(() => clock.uninstall());

    function publishReadModel(state, timestamp) {
        runner.object.state = state;
        dataSubject.onNext({
            type: "Mock",
            payload: state,
            timestamp: timestamp
        });
    }

    context("when a snapshot is present", () => {
        let snapshot = new Snapshot(42, new Date(5000));
        beforeEach(async () => {
            snapshotRepository.setup(s => s.getSnapshot("Mock")).returns(a => Promise.resolve(snapshot));
            runner.setup(r => r.run(It.isValue(snapshot)));
            await subject.run();
        });

        it("should init a projection runner with that snapshot", () => {
            runner.verify(r => r.run(It.isValue(snapshot)), Times.once());
        });
    });

    context("when a snapshot is not present", () => {
        beforeEach(async () => {
            snapshotRepository.setup(s => s.getSnapshot("Mock")).returns(a => Promise.resolve(null));
            await subject.run();
        });
        it("should init a projection runner without a snapshot", () => {
            runner.verify(r => r.run(null), Times.once());
        });
    });

    context("when some snapshots needs to be processed", () => {
        beforeEach(() => {
            asyncPublisher.reset();
            asyncPublisher.setup(a => a.items()).returns(() => Observable.create(observer => {
                observer.onNext(["Mock", new Snapshot(66, new Date(5000))]);
            }));
            snapshotRepository.setup(s => s.saveSnapshot("Mock", It.isValue(new Snapshot(66, new Date(5000))))).returns(a => Observable.empty<void>());
            subject = new ProjectionEngine(runnerFactory.object, pushNotifier.object, registry.object, snapshotRepository.object,
                NullLogger, asyncPublisher.object);
        });
        it("should save them", () => {
            snapshotRepository.verify(s => s.saveSnapshot("Mock", It.isValue(new Snapshot(66, new Date(5000)))), Times.once());
        });

    });

    context("when a projections triggers a new state", () => {
        beforeEach(() => {
            snapshotRepository.setup(s => s.getSnapshot("Mock")).returns(a => Promise.resolve(null));
        });
        context("and a snapshot is needed", () => {
            beforeEach(() => {
                snapshotStrategy.setup(s => s.needsSnapshot(It.isValue({
                    type: "Mock",
                    payload: 66,
                    timestamp: new Date(5000)
                }))).returns(a => true);
                subject.run();
                publishReadModel(66, new Date(5000));
            });
            it("should save the snapshot", () => {
                asyncPublisher.verify(a => a.publish(It.isValue(["Mock", new Snapshot(66, new Date(5000))])), Times.once());
            });
        });

        context("and a snapshot is not needed", () => {
            beforeEach(() => {
                snapshotStrategy.setup(s => s.needsSnapshot(It.isValue({
                    type: "Mock",
                    payload: 66,
                    timestamp: new Date(5000)
                }))).returns(a => false);
                subject.run();
                publishReadModel(66, new Date(5000));
            });
            it("should not save the snapshot", () => {
                asyncPublisher.verify(a => a.publish(It.isValue(["Mock", new Snapshot(66, new Date(5000))])), Times.never());
            });
        });

        context("and the projection isn't a split", () => {
            beforeEach(() => {
                snapshotStrategy.setup(s => s.needsSnapshot(It.isAny())).returns(a => false);
                subject.run();
                publishReadModel(66, new Date(5000));
            });
            it("should notify on the main context", () => {
                clock.tick(200);

                pushNotifier.verify(p => p.notify(It.isValue(new PushContext("Admin", "Mock")), null), Times.once());
            });
        });

        context("and the projection is a split", () => {
            beforeEach(() => {
                snapshotStrategy.setup(s => s.needsSnapshot(It.isAny())).returns(a => false);
                subject.run();
                publishReadModel(66, new Date(5000));
            });
            it("should notify every split", () => {
                clock.tick(200);

                pushNotifier.verify(p => p.notify(It.isValue(new PushContext("Admin", "Mock")), "user-1"), Times.once());
                pushNotifier.verify(p => p.notify(It.isValue(new PushContext("Admin", "Mock")), "user-3"), Times.once());
            });
        });
    });
});
