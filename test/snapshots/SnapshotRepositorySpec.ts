import "bluebird";
import "reflect-metadata";
import expect = require("expect.js");
import CassandraSnapshotRepository from "../../scripts/snapshots/CassandraSnapshotRepository";
import * as TypeMoq from "typemoq";
import {Snapshot} from "../../scripts/snapshots/ISnapshotRepository";
import IProjectionRegistry from "../../scripts/registry/IProjectionRegistry";
import ProjectionRegistry from "../../scripts/registry/ProjectionRegistry";
import MockCassandraClient from "../fixtures/MockCassandraClient";
import ICassandraClient from "../../scripts/cassandra/ICassandraClient";
import * as Rx from "rx";

describe("Snapshot repository, given all the streams", () => {

    let subject:CassandraSnapshotRepository,
        registry:TypeMoq.Mock<IProjectionRegistry>,
        cassandraClient:TypeMoq.Mock<ICassandraClient>;

    beforeEach(() => {
        cassandraClient = TypeMoq.Mock.ofType(MockCassandraClient);
        registry = TypeMoq.Mock.ofType(ProjectionRegistry);
        cassandraClient.setup(c => c.execute(TypeMoq.It.isAny())).returns(a => Rx.Observable.just({
            rows: [
                {
                    "system.blobastext(memento)": 56,
                    "lastevent": 7393898,
                    "split": "",
                    "streamid": "list"
                },
                {
                    "system.blobastext(memento)": 7800,
                    "lastevent": 77472487,
                    "split": "first-key",
                    "streamid": "detail"
                },
                {
                    "system.blobastext(memento)": 6000,
                    "lastevent": 77472487,
                    "split": "second-key",
                    "streamid": "detail"
                }
            ]
        }));
        subject = new CassandraSnapshotRepository(cassandraClient.object, registry.object);
    });

    context("when the snapshots associated needs to be retrieved", () => {
        it("should return the list of available snapshots", () => {
            let snapshots = null;
            subject.getSnapshots().subscribe(value => {
                snapshots = value;
            });
            expect(snapshots).to.eql({
                "list": new Snapshot(56, new Date(7393898)),
                "detail": new Snapshot({
                    "first-key": 7800,
                    "second-key": 6000
                }, new Date(77472487))
            });
        });
    });
});