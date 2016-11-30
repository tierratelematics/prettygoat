import "reflect-metadata";
import "bluebird";
import expect = require("expect.js");
import * as TypeMoq from "typemoq";
import CassandraStreamFactory from "../scripts/cassandra/CassandraStreamFactory";
import TimePartitioner from "../scripts/util/TimePartitioner";
import MockCassandraDeserializer from "./fixtures/MockCassandraDeserializer";
import ICassandraClient from "../scripts/cassandra/ICassandraClient";
import MockCassandraClient from "./fixtures/MockCassandraClient";
import * as Rx from "rx";
import {Event} from "../scripts/streams/Event";

describe("Cassandra stream factory, given a stream factory", () => {

    let client:TypeMoq.Mock<ICassandraClient>;
    let subject:CassandraStreamFactory;
    let timePartitioner:TypeMoq.Mock<TimePartitioner>;
    let events:Event[];

    beforeEach(() => {
        events = [];
        timePartitioner = TypeMoq.Mock.ofType(TimePartitioner);
        let cassandraDeserializer = new MockCassandraDeserializer();
        client = TypeMoq.Mock.ofType(MockCassandraClient);
        client.setup(c => c.execute("select distinct timebucket from event_by_timestamp")).returns(a => Rx.Observable.just({
            rows: [
                {"timebucket": "20150003"},
                {"timebucket": "20150001"},
                {"timebucket": "20150002"}
            ]
        }));
        subject = new CassandraStreamFactory(client.object, timePartitioner.object, cassandraDeserializer);
    });

    context("when all the events needs to be fetched", () => {
        beforeEach(() => {
            setupClient(client, null);
        });

        it("should retrieve the events from the beginning", () => {
            subject.from(null, Rx.Observable.empty<void>(), {}).subscribe(event => events.push(event));
            expect(events).to.have.length(4);
            expect(events[0].payload).to.be(10);
            expect(events[1].payload).to.be(20);
            expect(events[2].payload).to.be(0);
            expect(events[3].payload).to.be(30);
        });
    });

    context("when starting the stream from a certain point", () => {
        beforeEach(() => {
            timePartitioner.setup(t => t.bucketsFrom(TypeMoq.It.isValue(new Date(1420160400000)))).returns(a => [
                "20150002", "20150003"
            ]);
            setupClient(client, new Date(1420160400000));
        });

        it("should retrieve the events in all the buckets greater than that point", () => {
            subject.from(new Date(1420160400000), Rx.Observable.empty<void>(), {}).subscribe(event => events.push(event));
            expect(events).to.have.length(1);
            expect(events[0].payload).to.be(30);
        });
    });

    function setupClient(client: TypeMoq.Mock<ICassandraClient>, date: Date) {
        client.setup(c => c.paginate(filterByTimestamp("select blobAsText(event), timestamp from event_by_timestamp where timebucket = '20150001'", date), TypeMoq.It.isAny()))
            .returns(a => Rx.Observable.create(observer => {
                observer.onNext({
                    type: "Event1",
                    payload: 10,
                    splitKey: null,
                    timestamp: null
                });
                observer.onNext({
                    type: "Event1",
                    payload: 20,
                    splitKey: null,
                    timestamp: null
                });
                observer.onNext({
                    type: "Event2",
                    payload: 0,
                    splitKey: null,
                    timestamp: null
                });
                observer.onCompleted();
                return Rx.Disposable.empty;
            }));
        client.setup(c => c.paginate(filterByTimestamp("select blobAsText(event), timestamp from event_by_timestamp where timebucket = '20150002'", date), TypeMoq.It.isAny()))
            .returns(a => Rx.Observable.create(observer => {
                observer.onCompleted();
                return Rx.Disposable.empty;
            }));
        client.setup(c => c.paginate(filterByTimestamp("select blobAsText(event), timestamp from event_by_timestamp where timebucket = '20150003'", date), TypeMoq.It.isAny()))
            .returns(a => Rx.Observable.create(observer => {
                observer.onNext({
                    type: "Event1",
                    payload: 30,
                    splitKey: null,
                    timestamp: null
                });
                observer.onCompleted();
                return Rx.Disposable.empty;
            }));
    }

    function filterByTimestamp(query: string, timestamp: Date): string {
        if (timestamp)
            query += ` and timestamp > maxTimeUuid('${timestamp.toISOString()}')`;
        return query;
    }
});