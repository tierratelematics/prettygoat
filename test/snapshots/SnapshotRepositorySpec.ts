/// <reference path="../../node_modules/typemoq/typemoq.node.d.ts" />
import "bluebird";
import "reflect-metadata";
import expect = require("expect.js");
import CassandraSnapshotRepository from "../../scripts/snapshots/CassandraSnapshotRepository";
import {Mock, Times, It} from "typemoq";
import ICassandraClientFactory from "../../scripts/streams/ICassandraClientFactory";
import CassandraClientFactory from "../../scripts/streams/CassandraClientFactory";
import {Snapshot} from "../../scripts/snapshots/ISnapshotRepository";
import IProjectionRegistry from "../../scripts/registry/IProjectionRegistry";
import ProjectionRegistry from "../../scripts/registry/ProjectionRegistry";

describe("Snapshot repository, given all the streams", () => {

    let subject:CassandraSnapshotRepository,
        clientFactory:Mock<ICassandraClientFactory>,
        registry:Mock<IProjectionRegistry>;

    beforeEach(() => {
        clientFactory = Mock.ofType(CassandraClientFactory);
        registry = Mock.ofType(ProjectionRegistry);
        subject = new CassandraSnapshotRepository(clientFactory.object, null, registry.object);
    });

    context("when the snapshots associated needs to be retrieved", () => {
        beforeEach(() => {
            clientFactory.setup(c => c.clientFor(null)).returns(a => mockData({
                rows: [
                    {
                        "system.blobastext(memento)": 56,
                        "lastevent": "7393898",
                        "split": "",
                        "streamid": "list"
                    },
                    {
                        "system.blobastext(memento)": 7800,
                        "lastevent": "77472487",
                        "split": "first-key",
                        "streamid": "detail"
                    },
                    {
                        "system.blobastext(memento)": 6000,
                        "lastevent": "77472487",
                        "split": "second-key",
                        "streamid": "detail"
                    }
                ]
            }));
        });
        it("should return the list of available snapshots", () => {
            let snapshots = null;
            subject.getSnapshots().subscribe(value => snapshots = value);
            expect(snapshots).to.eql({
                "list": new Snapshot(56, "7393898"),
                "detail": new Snapshot({
                    "first-key": 7800,
                    "second-key": 6000
                }, "77472487")
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