import "reflect-metadata";
import expect = require("expect.js");
import IProjectionEngine from "../../scripts/projections/IProjectionEngine";
import {IProjection} from "../../scripts/projections/IProjection";
import {Subject, Observable} from "rx";
import RegistryEntry from "../../scripts/registry/RegistryEntry";
import {ISnapshotRepository, Snapshot} from "../../scripts/snapshots/ISnapshotRepository";
import IProjectionRegistry from "../../scripts/registry/IProjectionRegistry";
import AreaRegistry from "../../scripts/registry/AreaRegistry";
import MockSnapshotRepository from "../fixtures/MockSnapshotRepository";
import MockProjectionRegistry from "../fixtures/MockProjectionRegistry";
import * as TypeMoq from "typemoq";
import DynamicNameProjection from "../fixtures/definitions/DynamicNameProjection";
import ICluster from "../../scripts/cluster/ICluster";
import MockCluster from "../fixtures/cluster/MockCluster";
import ClusteredProjectionEngine from "../../scripts/cluster/ClusteredProjectionEngine";
import {Scheduler} from "rx";
import Dictionary from "../../scripts/Dictionary";
import MockProjectionEngine from "../fixtures/MockProjectionEngine";

describe("Given a set of nodes", () => {
    let subject: IProjectionEngine,
        registry: TypeMoq.Mock<IProjectionRegistry>,
        snapshotRepository: TypeMoq.Mock<ISnapshotRepository>,
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
        engine = TypeMoq.Mock.ofType(MockProjectionEngine);
        subject = new ClusteredProjectionEngine(engine.object, registry.object, snapshotRepository.object, {});
    });
    context("when the cluster starts", () => {
        beforeEach(() => {
            cluster.setup(c => c.lookup("projection1")).returns(() => "not-my-ip");
            cluster.setup(c => c.lookup("projection2")).returns(() => "my-ip");
        });
        it("should run the projections that match", () => {
            subject.run();
            engine.verify(e => e.run(TypeMoq.It.isValue(projection1), TypeMoq.It.isAny()), TypeMoq.Times.never());
            engine.verify(e => e.run(TypeMoq.It.isValue(projection2), TypeMoq.It.isAny()), TypeMoq.Times.once());
        });
    });
});