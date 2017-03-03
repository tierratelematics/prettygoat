import "reflect-metadata";
import expect = require("expect.js");
import CassandraSnapshotRepository from "../../scripts/cassandra/CassandraSnapshotRepository";
import {Mock, IMock, Times, It} from "typemoq";
import {Snapshot} from "../../scripts/snapshots/ISnapshotRepository";
import IProjectionRegistry from "../../scripts/registry/IProjectionRegistry";
import {ICassandraClient, IQuery} from "../../scripts/cassandra/ICassandraClient";
import * as Rx from "rx";
import RegistryEntry from "../../scripts/registry/RegistryEntry";
import MockProjectionDefinition from "../fixtures/definitions/MockProjectionDefinition";
import SplitProjectionDefinition from "../fixtures/definitions/SplitProjectionDefinition";

describe("Snapshot repository, given all the streams", () => {

    let subject: CassandraSnapshotRepository,
        registry: IMock<IProjectionRegistry>,
        cassandraClient: IMock<ICassandraClient>;

    beforeEach(() => {
        cassandraClient = Mock.ofType<ICassandraClient>();
        registry = Mock.ofType<IProjectionRegistry>();
        subject = new CassandraSnapshotRepository(cassandraClient.object, registry.object);
    });

    context("when the snapshots associated needs to be retrieved", () => {
        it("should return the list of available snapshots", () => {
            cassandraClient.setup(c => c.execute(It.isValue<IQuery>(["select blobAsText(memento) as memento, streamid," +
            " lastEvent, split from projections_snapshots", null]))).returns(a => Rx.Observable.just({
                rows: [
                    {
                        "memento": 56,
                        "lastevent": 7393898,
                        "split": "",
                        "streamid": "list"
                    },
                    {
                        "memento": 7800,
                        "lastevent": 77472487,
                        "split": "first-key",
                        "streamid": "detail"
                    },
                    {
                        "memento": 6000,
                        "lastevent": 77472487,
                        "split": "second-key",
                        "streamid": "detail"
                    }
                ]
            }));
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
        it("should handle correctly escaped strings", () => {
            cassandraClient.setup(c => c.execute(It.isValue<IQuery>(["select blobAsText(memento) as memento, streamid," +
            " lastEvent, split from projections_snapshots", null]))).returns(a => Rx.Observable.just({
                rows: [
                    {
                        "memento": '"\'\'"',
                        "lastevent": 7393898,
                        "split": "",
                        "streamid": "list"
                    }
                ]
            }));
            let snapshots = null;
            subject.getSnapshots().subscribe(value => {
                snapshots = value;
            });
            expect(snapshots).to.eql({
                "list": new Snapshot("'", new Date(7393898))
            });
        });

        it("should handle correctly undefined values", () => {
            cassandraClient.setup(c => c.execute(It.isValue<IQuery>(["select blobAsText(memento) as memento, streamid," +
            " lastEvent, split from projections_snapshots", null]))).returns(a => Rx.Observable.just({
                rows: [
                    {
                        memento: 'undefined',
                        streamid: 'Asset:Detail',
                        lastevent: 7393898,
                        split: '6654'
                    }
                ]
            }));
            let snapshots = null;
            subject.getSnapshots().subscribe(value => {
                snapshots = value;
            });
            expect(snapshots).to.eql({
                "Asset:Detail": new Snapshot({"6654": null}, new Date(7393898))
            });
        });
    });

    context("when a snapshot needs to be saved", () => {
        beforeEach(() => {
            cassandraClient.setup(c => c.execute(It.isAny())).returns(a => Rx.Observable.just(null));
        });

        context("and the associated projection is not a split", () => {
            beforeEach(() => {
                registry.setup(r => r.getEntry("test")).returns(() => {
                    return {
                        area: null,
                        data: new RegistryEntry(new MockProjectionDefinition().define(), null)
                    }
                });
            });
            it("should save the snapshot correctly", () => {
                let snapshot = new Snapshot({a: 25}, new Date(500));
                subject.saveSnapshot("test", snapshot).subscribe(() => {
                });
                cassandraClient.verify(c => c.execute(It.isValue<IQuery>(["insert into projections_snapshots (streamid, split, lastevent, memento) values (:streamId," +
                ":splitKey, :lastEvent, textAsBlob(:memento))", {
                    memento: '{"a":25}',
                    lastEvent: snapshot.lastEvent.toISOString(),
                    streamId: 'test',
                    splitKey: ""
                }])), Times.once());
            });
            it("should escape single quotes correctly", () => {
                let snapshot = new Snapshot({a: "''"}, new Date(500));
                subject.saveSnapshot("test", snapshot).subscribe(() => {
                });
                cassandraClient.verify(c => c.execute(It.isValue<IQuery>(["insert into projections_snapshots (streamid, split, lastevent, memento) values (:streamId," +
                ":splitKey, :lastEvent, textAsBlob(:memento))", {
                    memento: '{"a":"\'\'\'\'"}',
                    lastEvent: snapshot.lastEvent.toISOString(),
                    streamId: 'test',
                    splitKey: ""
                }])), Times.once());
            });
            it("should handle correctly a snapshot with an undefined value", () => {
                let snapshotUndefined = new Snapshot(undefined, new Date(500));
                subject.saveSnapshot("test", snapshotUndefined).subscribe(() => {
                });

                cassandraClient.verify(c => c.execute(It.isValue<IQuery>(["insert into projections_snapshots (streamid, split, lastevent, memento) values (:streamId," +
                ":splitKey, :lastEvent, textAsBlob(:memento))", {
                    memento: null,
                    lastEvent: snapshotUndefined.lastEvent.toISOString(),
                    streamId: "test",
                    splitKey: ""
                }])), Times.once());
            });

            it("should delete the current snapshot before saving the new one", () => {
                let snapshot = new Snapshot({a: 25}, new Date(500));
                subject.saveSnapshot("test", snapshot).subscribe(() => {
                });

                cassandraClient.verify(c => c.execute(It.isValue<IQuery>(["delete from projections_snapshots where streamid = :streamId", {
                    streamId: "test"
                }])), Times.once());
                cassandraClient.verify(c => c.execute(It.isValue<IQuery>(["insert into projections_snapshots (streamid, split, lastevent, memento) values (:streamId," +
                ":splitKey, :lastEvent, textAsBlob(:memento))", {
                    memento: '{"a":25}',
                    lastEvent: snapshot.lastEvent.toISOString(),
                    streamId: 'test',
                    splitKey: ""
                }])), Times.once());
            });
        });

        context("and the associated projection is a split", () => {
            beforeEach(() => {
                registry.setup(r => r.getEntry("split")).returns(a => {
                    return {
                        area: null,
                        data: new RegistryEntry(new SplitProjectionDefinition().define(), null)
                    }
                });
            });
            it("should save every entry in a different row", () => {
                let snapshot = new Snapshot({a: 25, b: 30}, new Date(500));
                let streamId = "split";
                subject.saveSnapshot(streamId, snapshot).subscribe(() => {
                });
                cassandraClient.verify(c => c.execute(It.isValue<IQuery>(["insert into projections_snapshots (streamid, split, lastevent, memento) values (:streamId," +
                ":splitKey, :lastEvent, textAsBlob(:memento))", {
                    memento: "25",
                    lastEvent: snapshot.lastEvent.toISOString(),
                    streamId: "split",
                    splitKey: "a"
                }])), Times.once());

                cassandraClient.verify(c => c.execute(It.isValue<IQuery>(["insert into projections_snapshots (streamid, split, lastevent, memento) values (:streamId," +
                ":splitKey, :lastEvent, textAsBlob(:memento))", {
                    memento: "30",
                    lastEvent: snapshot.lastEvent.toISOString(),
                    streamId: "split",
                    splitKey: "b"
                }])), Times.once());
            });
        });
    });

    context("when a snapshot needs to be deleted", () => {
        beforeEach(() => {
            cassandraClient.setup(c => c.execute(It.isAny())).returns(a => Rx.Observable.just(null));
        });
        it("should remove it correctly", () => {
            subject.deleteSnapshot("test");
            cassandraClient.verify(c => c.execute(It.isValue<IQuery>(["delete from projections_snapshots where streamid = :streamId", {
                streamId: "test"
            }])), Times.once());
        });
    });
});