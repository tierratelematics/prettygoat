import "reflect-metadata";
import expect = require("expect.js");
import IProjectionEngine from "../scripts/projections/IProjectionEngine";
import ProjectionEngine from "../scripts/projections/ProjectionEngine";
import {IProjectionRunner, NotificationTuple} from "../scripts/projections/IProjectionRunner";
import {ReplaySubject, Observable} from "rxjs";
import IProjectionRunnerFactory from "../scripts/projections/IProjectionRunnerFactory";
import {Event} from "../scripts/events/Event";
import {IMock, Mock, Times, It, ExpectedCallType} from "typemoq";
import {ISnapshotRepository, Snapshot} from "../scripts/snapshots/ISnapshotRepository";
import MockProjectionDefinition from "./fixtures/definitions/MockProjectionDefinition";
import {ISnapshotStrategy} from "../scripts/snapshots/ISnapshotStrategy";
import {IProjection} from "../scripts/projections/IProjection";
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
import {ISnapshotProducer} from "../scripts/snapshots/SnapshotProducer";
import { READMODEL_DEFAULT_NOTIFY } from "../scripts/readmodels/IReadModel";

describe("Given a ProjectionEngine", () => {

    let subject: IProjectionEngine,
        registry: IMock<IProjectionRegistry>,
        pushNotifier: IMock<IPushNotifier>,
        snapshotStrategy: IMock<ISnapshotStrategy>,
        runner: IMock<IProjectionRunner<any>>,
        runnerFactory: IMock<IProjectionRunnerFactory>,
        snapshotRepository: IMock<ISnapshotRepository>,
        dataSubject: ReplaySubject<[Event, Dictionary<string[]>]>,
        projection: IProjection<number>,
        asyncPublisher: IMock<IAsyncPublisher<any>>,
        clock: lolex.Clock,
        readModelNotifier: IMock<IReadModelNotifier>,
        snapshotProducer: IMock<ISnapshotProducer>,
        snapshotsHolder: Dictionary<Snapshot>;

    beforeEach(() => {
        clock = lolex.install();
        asyncPublisher = Mock.ofType<IAsyncPublisher<any>>();
        asyncPublisher.setup(a => a.items()).returns(() => Observable.empty());
        asyncPublisher.setup(a => a.items(It.is<any>(value => !!value))).returns(() => Observable.empty());
        let asyncPublisherFactory = Mock.ofType<IAsyncPublisherFactory>();
        asyncPublisherFactory.setup(a => a.publisherFor(It.isAny())).returns(() => asyncPublisher.object);
        snapshotStrategy = Mock.ofType<ISnapshotStrategy>();
        projection = new MockProjectionDefinition(snapshotStrategy.object).define();
        dataSubject = new ReplaySubject<NotificationTuple>();
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
        snapshotProducer = Mock.ofType<ISnapshotProducer>();
        snapshotsHolder = {};
        subject = new ProjectionEngine(runnerFactory.object, pushNotifier.object, registry.object, snapshotRepository.object,
            asyncPublisherFactory.object, readModelNotifier.object, snapshotProducer.object, snapshotsHolder);
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
            timestamp: timestamp,
            id: "test-readmodel"
        }, notificationKeys]);
    }

    context("when starting the projections", () => {
        beforeEach(async () => {
            snapshotRepository.setup(s => s.getSnapshot(It.isAny())).returns(a => Promise.resolve(null));
            let readmodel = new MockReadModel().define();
            registry.reset();
            registry.setup(r => r.projections()).returns(() => [["Admin", projection], ["Readmodel", <IProjection>readmodel]]);
            registry.setup(r => r.projectionFor("Mock")).returns(() => ["Admin", projection]);
            registry.setup(r => r.projectionFor("ReadModel")).returns(() => ["Readmodel", <IProjection>readmodel]);
            // Cast to suppress a typing typemoq bug
            (<any>runnerFactory.setup(r => r.create(It.isValue(<IProjection>readmodel))).returns(() => runner.object)).verifiable(Times.once(), ExpectedCallType.InSequence);
            (<any>runnerFactory.setup(r => r.create(It.isValue(projection))).returns(() => runner.object)).verifiable(Times.once(), ExpectedCallType.InSequence);

            await subject.run();
        });
        it("should run the reamodels first", () => {
            runnerFactory.verifyAll();
        });
    });

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

        it("should cache the snapshot", () => {
            expect(snapshotsHolder["Mock"]).to.be(snapshot);
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

    context("when a snapshot fails to load", () => {
        beforeEach(async () => {
            snapshotRepository.setup(s => s.getSnapshot("Mock")).returns(a => Promise.reject(new Error()));
            await subject.run();
        });
        it("should start the projection with no snapshot", () => {
            runner.verify(r => r.run(null), Times.once());
        });
    });

    context("when some snapshots needs to be processed", () => {
        beforeEach(async () => {
            asyncPublisher.reset();
            asyncPublisher.setup(a => a.items()).returns(() => Observable.of(["Mock", new Snapshot(66, new Date(5000))]));
            asyncPublisher.setup(a => a.items(It.is<any>(value => !!value))).returns(() => Observable.empty());
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
            snapshotProducer.setup(s => s.produce(It.isAny())).returns(() => {
                return new Snapshot(66, new Date(5000), [
                    {id: "test", timestamp: new Date(10)}
                ]);
            });
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
                asyncPublisher.verify(a => a.publish(It.isValue(["Mock", new Snapshot(66, new Date(5000), [
                    {id: "test", timestamp: new Date(10)}
                ])])), Times.once());
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
                asyncPublisher.verify(a => a.publish(It.isAny()), Times.never());
            });
        });

        it("should notify on all the registered publish points correctly", async () => {
            publishState(66, new Date(5000), {List: [null], "Detail": ["66"]});
            await subject.run();

            asyncPublisher.verify(a => a.publish(It.isValue([new PushContext("Admin", "List"), null, {
                type: "Mock",
                payload: 66,
                timestamp: new Date(5000)
            }])), Times.once());
            asyncPublisher.verify(a => a.publish(It.isValue([new PushContext("Admin", "Detail"), "66", {
                type: "Mock",
                payload: 66,
                timestamp: new Date(5000)
            }])), Times.once());
        });

        it("should not notify the publish points with an undefined key", async () => {
            publishState(66, new Date(5000), {List: [undefined]});
            await subject.run();

            asyncPublisher.verify(a => a.publish(It.isAny()), Times.never());
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
            readModelNotifier.setup(r => r.changes("a")).returns(() => Observable.of<[Event, string]>([{
                type: SpecialEvents.READMODEL_CHANGED,
                payload: "a",
                timestamp: new Date(10000)
            }, null]));
            readModelNotifier.setup(r => r.changes("b")).returns(() => Observable.of<[Event, string]>([{
                type: SpecialEvents.READMODEL_CHANGED,
                payload: "b",
                timestamp: new Date(11000)
            }, null]));
            publishState(66, new Date(5000));
            await subject.run();
        });
        it("should notify the publish points that depend on it", () => {
            asyncPublisher.verify(a => a.publish(It.isValue([new PushContext("Admin", "Dependency"), "some-client", {
                type: SpecialEvents.READMODEL_CHANGED,
                payload: "a",
                timestamp: new Date(10000)
            }])), Times.once());
            asyncPublisher.verify(a => a.publish(It.isValue([new PushContext("Admin", "NoDependencies"), null])), Times.never());
        });
    });

    context("when some notifications needs to be processed", () => {
        beforeEach(async () => {
            asyncPublisher.reset();
            asyncPublisher.setup(a => a.items(It.is<any>(value => !!value))).returns(() => Observable.of([
                new PushContext("Admin", "Test"), "testkey", {
                    timestamp: new Date(1000),
                    id: null,
                    type: null,
                    payload: null
                }]));
            asyncPublisher.setup(a => a.items()).returns(() => Observable.empty());
            await subject.run();
        });
        it("should process them", () => {
            pushNotifier.verify(p => p.notifyAll(It.isValue(new PushContext("Admin", "Test")), It.isValue({
                timestamp: new Date(1000),
                id: null,
                type: null,
                payload: null
            }), "testkey"), Times.once());
        });
    });

    context("when the running readmodel triggers a new state", () => {
        beforeEach(async () => {
            let readModel = <IProjection>new MockReadModel().define();
            registry.reset();
            registry.setup(r => r.projections()).returns(() => [[SpecialAreas.Readmodel, readModel]]);
            registry.setup(r => r.projectionFor("ReadModel")).returns(() => [SpecialAreas.Readmodel, readModel]);
            let notificationKeys = {};
            notificationKeys[READMODEL_DEFAULT_NOTIFY] = ["test-key"];
            publishReadModel(66, new Date(5000), notificationKeys);
            await subject.run();
        });
        it("should notify that the model has changed", () => {
            readModelNotifier.verify(r => r.notifyChanged(It.isValue({
                type: "ReadModel",
                payload: 66,
                timestamp: new Date(5000),
                id: "test-readmodel"
            }), "test-key"), Times.once());
        });
    });
});
