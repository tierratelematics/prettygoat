import "reflect-metadata";
import expect = require("expect.js");
import CassandraDeserializer from "../../scripts/cassandra/CassandraDeserializer";
import {MockTimeStamp} from '../fixtures/MockTimeStamp';

describe("Given a CassandraDeserializer", () => {
    let subject: CassandraDeserializer;

    beforeEach(() => subject = new CassandraDeserializer());

    context("when a new event is coming", () => {
        it("should be parsed", () => {
            let eventRow = {
                event: JSON.stringify({
                    "id": "id",
                    "createdTimestamp": "2016-07-11T14:17:01.359Z",
                    "payload": {
                        "$manifest": "iot.eventType",
                        "customProperty_1": "payload.customProperty_1",
                        "customProperty_2": "payload.customProperty_2"
                    },
                    "metadata": {
                        "causationId": "metadata.causationId"
                    }
                }),
                timestamp: new MockTimeStamp("2016-07-11T14:17:01.359Z")
            };

            expect(subject.toEvent(eventRow)).to.be.eql({
                "type": "iot.eventType",
                "payload": {
                    "$manifest": "iot.eventType",
                    "customProperty_1": "payload.customProperty_1",
                    "customProperty_2": "payload.customProperty_2"
                },
                "timestamp": new Date("2016-07-11T14:17:01.359Z"),
                "splitKey": null
            });
        });
    });
});
