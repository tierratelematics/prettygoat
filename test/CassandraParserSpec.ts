import expect = require("expect.js");
import CassandraDeserializer from "../scripts/cassandra/CassandraDeserializer";
import {MockTimeStamp} from './fixtures/MockTimeStamp';

describe("CassandraDeserializer, given an event", () => {
    let subject:CassandraDeserializer;

    beforeEach(() => subject = new CassandraDeserializer());

    context("when the event is a valid one of old type", () => {
        it("should handle it and return the converted object", () => {
            let eventRow = {
                event: JSON.stringify({
                    "type": "iot.eventType",
                    "id": "id",
                    "createdTimestamp": "2016-07-11T14:17:01.359Z",
                    "payload": {
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
                    "customProperty_1": "payload.customProperty_1",
                    "customProperty_2": "payload.customProperty_2"
                },
                "timestamp": new Date("2016-07-11T14:17:01.359Z"),
                "splitKey": null
            });
        });
    });
});
