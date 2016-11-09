import "bluebird";
import "reflect-metadata";
import expect = require("expect.js");
import CassandraSnapshotRepository from "../../scripts/snapshots/CassandraSnapshotRepository";
import * as TypeMoq from "typemoq";
import ICassandraClientFactory from "../../scripts/cassandra/ICassandraClientFactory";
import CassandraClientFactory from "../../scripts/cassandra/CassandraClientFactory";
import {Snapshot} from "../../scripts/snapshots/ISnapshotRepository";
import IProjectionRegistry from "../../scripts/registry/IProjectionRegistry";
import ProjectionRegistry from "../../scripts/registry/ProjectionRegistry";

describe("Snapshot repository, given all the streams", () => {

    let subject:CassandraSnapshotRepository,
        clientFactory:TypeMoq.Mock<ICassandraClientFactory>,
        registry:TypeMoq.Mock<IProjectionRegistry>;

    beforeEach(() => {
        clientFactory = TypeMoq.Mock.ofType(CassandraClientFactory);
        registry = TypeMoq.Mock.ofType(ProjectionRegistry);
        clientFactory.setup(c => c.clientFor(null)).returns(a => mockData({
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
        subject = new CassandraSnapshotRepository(clientFactory.object, null, registry.object);
    });

    context("when the snapshots associated needs to be retrieved", () => {
        it("should return the list of available snapshots", () => {
            let snapshots = null;
            subject.getSnapshots().subscribe(value => snapshots = value);
            expect(snapshots).to.eql({
                "list": new Snapshot(56, new Date(7393898)),
                "detail": new Snapshot({
                    "first-key": 7800,
                    "second-key": 6000
                }, new Date(77472487))
            });
        });
    });

    function mockData(data:any) {
        return {
            execute: function (string, callback) {
                callback(null, data);
            }
        }
    }
});