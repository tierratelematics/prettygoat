import "reflect-metadata";
import expect = require("expect.js");
import IProjectionEngine from "../scripts/projections/IProjectionEngine";
import ProjectionEngine from "../scripts/projections/ProjectionEngine";
import {IProjectionRunner} from "../scripts/projections/IProjectionRunner";
import {ReplaySubject, Observable} from "rxjs";
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
import {IPushNotifier} from "../scripts/push/PushComponents";
import IAsyncPublisher from "../scripts/common/IAsyncPublisher";
import {IProjectionRegistry, SpecialAreas} from "../scripts/bootstrap/ProjectionRegistry";
import {IReadModelNotifier} from "../scripts/readmodels/ReadModelNotifier";
import MockReadModel from "./fixtures/definitions/MockReadModel";
import SpecialEvents from "../scripts/events/SpecialEvents";
import PushContext from "../scripts/push/PushContext";
import Dictionary from "../scripts/common/Dictionary";
import {IAsyncPublisherFactory} from "../scripts/common/AsyncPublisherFactory";

describe("Given a ProjectionEngine", () => {

    let subject: IProjectionEngine,
        registry: IMock<IProjectionRegistry>,
        pushNotifier: IMock<IPushNotifier>,
        snapshotStrategy: IMock<ISnapshotStrategy>,
        runner: IMock<IProjectionRunner<number>>,
        runnerFactory: IMock<IProjectionRunnerFactory>,
        snapshotRepository: IMock<ISnapshotRepository>,
        dataSubject: ReplaySubject<[Event, Dictionary<string[]>]>,
        projection: IProjection<number>,
        asyncPublisher: IMock<IAsyncPublisher<any>>,
        clock: lolex.Clock,
        readModelNotifier: IMock<IReadModelNotifier>;

    beforeEach(() => {
        clock = lolex.install();
        asyncPublisher = Mock.ofType<IAsyncPublisher<any>>();
        asyncPublisher.setup(a => a.items()).returns(() => Observable.empty());
        let asyncPublisherFactory = Mock.ofType<IAsyncPublisherFactory>();
        asyncPublisherFactory.setup(a => a.publisherFor(It.isAny())).returns(() => asyncPublisher.object);
        snapshotStrategy = Mock.ofType<ISnapshotStrategy>();
        projection = new MockProjectionDefinition(snapshotStrategy.object).define();
        dataSubject = new ReplaySubject<[Event, Dictionary<string[]>]>();
        runner = Mock.ofType(MockProjectionRunner);
        runner.setup(r => r.notifications()).returns(a => dataSubject);
        pushNotifier = Mock.ofType<IPushNotifier>();
        runnerFactory = Mock.ofType<IProjectionRunnerFactory>();
        runnerFactory.setup(r => r.create(It.isAny())).returns(a => runner.object);
        registry = Mock.ofType<IProjectionRegistry>();
        registry.setup(r => r.projections()).returns(() => [["Admin", projection]]);
        registry.setup(r => r.projectionFor("Mock")).returns(() => ["Admin", projection]);
        snapshotRepository = Mock.ofType<ISnapshotRepository>();
        readModelNotifier = Mock.ofType<IReadModelNotifier>();
        subject = new ProjectionEngine(runnerFactory.object, pushNotifier.object, registry.object, snapshotRepository.object,
            NullLogger, asyncPublisherFactory.object, readModelNotifier.object);
    });

    afterEach(() => clock.uninstall());

    function publishState(state, timestamp, notificationKeys = {}) {
        runner.object.state = state;
        dataSubject.next([{
            type: "Mock",
            payload: state,
            timestamp: timestamp
        }, notificationKeys]);
    }

    function publishReadModel(state, timestamp, notificationKeys = {}) {
        runner.object.state = state;
        dataSubject.next([{
            type: "ReadModel",
            payload: state,
            timestamp: timestamp
        }, notificationKeys]);
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
        beforeEach(async () => {
            asyncPublisher.reset();
            asyncPublisher.setup(a => a.items()).returns(() => Observable.create(observer => {
                observer.next(["Mock", new Snapshot(66, new Date(5000))]);
            }));
            snapshotRepository.setup(s => s.saveSnapshot("Mock", It.isValue(new Snapshot(66, new Date(5000))))).returns(a => Promise.resolve());
            await subject.run();
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
            beforeEach(async () => {
                snapshotStrategy.setup(s => s.needsSnapshot(It.isValue({
                    type: "Mock",
                    payload: 66,
                    timestamp: new Date(5000)
                }))).returns(a => true);
                publishState(66, new Date(5000));
                await subject.run();
            });
            it("should save the snapshot", () => {
                asyncPublisher.verify(a => a.publish(It.isValue(["Mock", new Snapshot(66, new Date(5000))])), Times.once());
            });
        });

        context("and a snapshot is not needed", () => {
            beforeEach(async () => {
                snapshotStrategy.setup(s => s.needsSnapshot(It.isValue({
                    type: "Mock",
                    payload: 66,
                    timestamp: new Date(5000)
                }))).returns(a => false);
                publishState(66, new Date(5000));
                await subject.run();
            });
            it("should not save the snapshot", () => {
                asyncPublisher.verify(a => a.publish(It.isValue(["Mock", new Snapshot(66, new Date(5000))])), Times.never());
            });
        });

        it("should notify on all the registered publish points correctly", async () => {
            pushNotifier.setup(p => p.notify(It.isAny(), It.isAny()));
            publishState(66, new Date(5000), {List: [null], "Detail": ["66"]});
            await subject.run();

            pushNotifier.verify(p => p.notify(It.isValue(new PushContext("Admin", "List")), null), Times.once());
            pushNotifier.verify(p => p.notify(It.isValue(new PushContext("Admin", "Detail")), "66"), Times.once());
        });
    });

    context("when a readmodel triggers a new state", () => {
        beforeEach(async () => {
            projection.publish = {
                "Dependency": {
                    readmodels: {
                        $list: ["a"],
                        $change: () => ["some-client"]
                    }
                },
                "NoDependencies": {}
            };
            readModelNotifier.setup(r => r.changes("a")).returns(() => Observable.of({
                type: SpecialEvents.READMODEL_CHANGED,
                payload: "a",
                timestamp: new Date(10000)
            }));
            readModelNotifier.setup(r => r.changes("b")).returns(() => Observable.of({
                type: SpecialEvents.READMODEL_CHANGED,
                payload: "b",
                timestamp: new Date(11000)
            }));
            publishState(66, new Date(5000));
            await subject.run();
        });
        it("should notify the publish points that depend on it", () => {
            pushNotifier.verify(p => p.notify(It.isValue(new PushContext("Admin", "Dependency")), "some-client"), Times.once());
            pushNotifier.verify(p => p.notify(It.isValue(new PushContext("Admin", "NoDependencies"))), Times.never());
        });
    });

    context("when the running readmodel triggers a new state", () => {
        beforeEach(async () => {
            let readModel = <IProjection>new MockReadModel().define();
            registry.reset();
            registry.setup(r => r.projections()).returns(() => [[SpecialAreas.Readmodel, readModel]]);
            registry.setup(r => r.projectionFor("ReadModel")).returns(() => [SpecialAreas.Readmodel, readModel]);
            publishReadModel(66, new Date(5000));
            await subject.run();
        });
        it("should notify that the model has changed", () => {
            readModelNotifier.verify(r => r.notifyChanged("ReadModel", It.isValue(new Date(5000))), Times.once());
        });
    });
});
