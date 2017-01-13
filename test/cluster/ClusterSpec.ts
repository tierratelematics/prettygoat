import "reflect-metadata";
import expect = require("expect.js");
import IProjectionEngine from "../../scripts/projections/IProjectionEngine";
import ProjectionEngine from "../../scripts/projections/ProjectionEngine";
import {IProjection} from "../../scripts/projections/IProjection";
import {Subject, Observable} from "rx";
import MockProjectionSorter from "../fixtures/definitions/MockProjectionSorter";
import RegistryEntry from "../../scripts/registry/RegistryEntry";
import IProjectionRunnerFactory from "../../scripts/projections/IProjectionRunnerFactory";
import IProjectionSorter from "../../scripts/projections/IProjectionSorter";
import {ISnapshotRepository, Snapshot} from "../../scripts/snapshots/ISnapshotRepository";
import IProjectionRunner from "../../scripts/projections/IProjectionRunner";
import IPushNotifier from "../../scripts/push/IPushNotifier";
import IProjectionRegistry from "../../scripts/registry/IProjectionRegistry";
import MockProjectionDefinition from "../fixtures/definitions/MockProjectionDefinition";
import MockProjectionRunner from "../fixtures/MockProjectionRunner";
import MockPushNotifier from "../fixtures/web/MockPushNotifier";
import AreaRegistry from "../../scripts/registry/AreaRegistry";
import MockStatePublisher from "../fixtures/web/MockStatePublisher";
import MockSnapshotRepository from "../fixtures/MockSnapshotRepository";
import MockProjectionRegistry from "../fixtures/MockProjectionRegistry";
import MockProjectionRunnerFactory from "../fixtures/MockProjectionRunnerFactory";
import {Event} from "../../scripts/streams/Event";
import * as TypeMoq from "typemoq";

describe("Given a set of nodes", () => {
    let subject: IProjectionEngine,
        registry: TypeMoq.Mock<IProjectionRegistry>,
        pushNotifier: TypeMoq.Mock<IPushNotifier>,
        runner: TypeMoq.Mock<IProjectionRunner<number>>,
        runnerFactory: TypeMoq.Mock<IProjectionRunnerFactory>,
        projectionSorter: TypeMoq.Mock<IProjectionSorter>,
        snapshotRepository: TypeMoq.Mock<ISnapshotRepository>,
        dataSubject: Subject<Event>,
        projection: IProjection<number>;

    beforeEach(() => {
        projection = new MockProjectionDefinition().define();
        dataSubject = new Subject<Event>();
        runner = TypeMoq.Mock.ofType(MockProjectionRunner);
        runner.setup(r => r.notifications()).returns(a => dataSubject);
        pushNotifier = TypeMoq.Mock.ofType(MockPushNotifier);
        pushNotifier.setup(p => p.notify(TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(a => null);
        runnerFactory = TypeMoq.Mock.ofType(MockProjectionRunnerFactory);
        runnerFactory.setup(r => r.create(TypeMoq.It.isAny())).returns(a => runner.object);
        registry = TypeMoq.Mock.ofType(MockProjectionRegistry);
        registry.setup(r => r.getAreas()).returns(a => {
            return [
                new AreaRegistry("Admin", [
                    new RegistryEntry(projection, "Mock")
                ])
            ]
        });
        projectionSorter = TypeMoq.Mock.ofType(MockProjectionSorter);
        snapshotRepository = TypeMoq.Mock.ofType(MockSnapshotRepository);
        snapshotRepository.setup(s => s.saveSnapshot("test", TypeMoq.It.isValue(new Snapshot(66, new Date(5000))))).returns(a => null);
        snapshotRepository.setup(s => s.initialize()).returns(a => Observable.just(null));
        subject = new ProjectionEngine(runnerFactory.object, pushNotifier.object, registry.object, new MockStatePublisher(), snapshotRepository.object, null, projectionSorter.object);
    });

    context("when the cluster starts", () => {
        it("should run the projections that match", () => {

        });
    });

    context("when a projection running on a node dies", () => {
        it("should restart the projection");
    });
});