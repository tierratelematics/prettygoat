import "reflect-metadata";
import "bluebird";
import expect = require("expect.js");
import * as TypeMoq from "typemoq";
import CassandraStreamFactory from "../scripts/cassandra/CassandraStreamFactory";
import MockEventsFilter from "./fixtures/MockEventsFilter";
import TimePartitioner from "../scripts/util/TimePartitioner";
import MockCassandraDeserializer from "./fixtures/MockCassandraDeserializer";
import ICassandraClient from "../scripts/cassandra/ICassandraClient";
import MockCassandraClient from "./fixtures/MockCassandraClient";
import * as Rx from "rx";

describe("Cassandra stream factory, given a stream factory", () => {

    let client:TypeMoq.Mock<ICassandraClient>;
    let subject:CassandraStreamFactory;
    let events:any[];

    beforeEach(() => {
        events = [];
        let eventsFilter = TypeMoq.Mock.ofType(MockEventsFilter);
        let timePartitioner = TypeMoq.Mock.ofType(TimePartitioner);
        let cassandraDeserializer = new MockCassandraDeserializer();
        client = TypeMoq.Mock.ofType(MockCassandraClient);
        client.setup(c => c.execute("select distinct timebucket, ser_manifest from event_by_manifest")).returns(a => Rx.Observable.just({
            rows: []
        }));
        eventsFilter.setup(e => e.filter(TypeMoq.It.isAny())).returns(a => ["Event1"]);
        timePartitioner.setup(t => t.bucketsFrom(TypeMoq.It.isValue(new Date(1420070400000)))).returns(a => [
            "20150001", "20150002", "20150003"
        ]);
        subject = new CassandraStreamFactory(client.object, timePartitioner.object, cassandraDeserializer, eventsFilter.object);
    });

    context("when all the events needs to be fetched", () => {
        beforeEach(() => {
            setupClient(client, new Date(1420070400000));
        });

        it("should retrieve the events from the beginning", () => {
            subject.from(null).subscribe(event => events.push(event));
            expect(events).to.have.length(3);
            expect(events[0].payload).to.be(10);
            expect(events[1].payload).to.be(20);
            expect(events[2].payload).to.be(30);
        });
    });

    context("when starting the stream from a certain point", () => {
        beforeEach(() => {
            setupClient(client, new Date(1420160400000));
        });

        it("should retrieve the events in all the buckets greater than that point", () => {
            subject.from(new Date(1420160400000)).subscribe(event => events.push(event));
            expect(events).to.have.length(1);
            expect(events[0].payload).to.be(30);
        });
    });

    function setupClient(client:TypeMoq.Mock<ICassandraClient>, date:Date) {
        client.setup(c => c.stream(`select blobAsText(event), timestamp from event_by_manifest where timebucket = '20150001' " +
            "and timestamp > maxTimeUuid('${date.toISOString()}') and ser_manifest in ('Event1')"`))
            .returns(a => Rx.Observable.create(observer => {
                observer.onNext({
                    type: "Event1",
                    payload: 10
                });
                observer.onNext({
                    type: "Event1",
                    payload: 20
                });
                observer.onCompleted();
            }));
        client.setup(c => c.stream(`select blobAsText(event), timestamp from event_by_manifest where timebucket = '20150002' " +
            "and timestamp > maxTimeUuid('${date.toISOString()}') and ser_manifest in ('Event1')`))
            .returns(a => Rx.Observable.create(observer => {
                observer.onCompleted();
            }));
        client.setup(c => c.stream(`select blobAsText(event), timestamp from event_by_manifest where timebucket = '20150003' " +
            "and timestamp > maxTimeUuid('${date.toISOString()}') and ser_manifest in ('Event1')`))
            .returns(a => Rx.Observable.create(observer => {
                observer.onNext({
                    type: "Event1",
                    payload: 30
                });
                observer.onCompleted();
            }));
    }
});