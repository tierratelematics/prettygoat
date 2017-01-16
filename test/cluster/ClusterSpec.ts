import "reflect-metadata";
import expect = require("expect.js");
import IProjectionEngine from "../../scripts/projections/IProjectionEngine";
import {IProjection} from "../../scripts/projections/IProjection";
import {Subject, Observable} from "rx";
import RegistryEntry from "../../scripts/registry/RegistryEntry";
import {ISnapshotRepository, Snapshot} from "../../scripts/snapshots/ISnapshotRepository";
import IProjectionRunner from "../../scripts/projections/IProjectionRunner";
import IProjectionRegistry from "../../scripts/registry/IProjectionRegistry";
import MockProjectionDefinition from "../fixtures/definitions/MockProjectionDefinition";
import MockProjectionRunner from "../fixtures/MockProjectionRunner";
import AreaRegistry from "../../scripts/registry/AreaRegistry";
import MockSnapshotRepository from "../fixtures/MockSnapshotRepository";
import MockProjectionRegistry from "../fixtures/MockProjectionRegistry";
import {Event} from "../../scripts/streams/Event";
import * as TypeMoq from "typemoq";
import DynamicNameProjection from "../fixtures/definitions/DynamicNameProjection";
import ICluster from "../../scripts/cluster/ICluster";
import MockCluster from "../fixtures/cluster/MockCluster";
import IProjectionEngine from "../../scripts/projections/IProjectionEngine";
import ClusteredProjectionEngine from "../../scripts/cluster/ClusteredProjectionEngine";

describe("Given a set of nodes", () => {
    let subject: IProjectionEngine,
        registry: TypeMoq.Mock<IProjectionRegistry>,
        snapshotRepository: TypeMoq.Mock<ISnapshotRepository>,
        dataSubject: Subject<Event>,
        projection1: IProjection<any>,
        projection2: IProjection<any>,
        cluster: TypeMoq.Mock<ICluster>,
        engine: TypeMoq.Mock<IProjectionEngine>;

    beforeEach(() => {
        projection1 = new DynamicNameProjection("projection1").define();
        projection2 = new DynamicNameProjection("projection2").define();
        registry = TypeMoq.Mock.ofType(MockProjectionRegistry);
        registry.setup(r => r.getAreas()).returns(a => {
            return [
                new AreaRegistry("Admin", [
                    new RegistryEntry(projection1, "projection1"),
                    new RegistryEntry(projection2, "projection2")
                ])
            ]
        });
        snapshotRepository = TypeMoq.Mock.ofType(MockSnapshotRepository);
        snapshotRepository.setup(s => s.saveSnapshot("test", TypeMoq.It.isValue(new Snapshot(66, new Date(5000))))).returns(a => null);
        snapshotRepository.setup(s => s.initialize()).returns(a => Observable.just(null));
        snapshotRepository.setup(s => s.getSnapshots()).returns(a => Observable.just<Dictionary<Snapshot<any>>>({}).observeOn(Scheduler.immediate));
        cluster = TypeMoq.Mock.ofType(MockCluster);
        cluster.setup(c => c.whoami()).returns(() => "my-address");
        subject = new ClusteredProjectionEngine(engine.subject);
    });

    context("when the cluster starts", () => {
        beforeEach(() => {
            cluster.setup(c => c.lookup("projection1")).returns(() => "not-my-ip");
            cluster.setup(c => c.lookup("projection2")).returns(() => "my-ip");
        });
        it("should run the projections that match", () => {
            subject.run();
            engine.verify(e => e.run(TypeMoq.It.isValue(projection1)), TypeMoq.Times.never());
            engine.verify(e => e.run(TypeMoq.It.isValue(projection2)), TypeMoq.Times.once());
        });
    });

    context("when a projection running on a node dies", () => {
        beforeEach(() => {
            cluster.setup(c => c.lookup("projection2")).returns(() => "my-ip");
            subject.run();
            dataSubject.onError(new Error("Booom!"));
        });
        it("should restart the projection", () => {
            runnerFactory.verify(r => r.create(TypeMoq.It.isValue(projection2)), TypeMoq.Times.exactly(2));
        });
    });
});