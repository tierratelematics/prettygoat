import expect = require("expect.js");
import DefaultJsonCassandraDeserializer from "../scripts/streams/DefaultJsonCassandraDeserializer";
import { MockTimeStamp } from './fixtures/MockTimeStamp';

describe("DefaultJsonCassandraDeserializer, given an event", () => {
    let subject: DefaultJsonCassandraDeserializer;

    beforeEach(() => subject = new DefaultJsonCassandraDeserializer());

    context("when the event is a valid one of OLD type", () => {
        it("should handle it and return the converted object", () => {
            let eventRow = {
                "system.blobastext(event)": JSON.stringify({
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
                "timestamp": new MockTimeStamp("2016-07-11T14:17:01.359Z")
            };

            expect(subject.toEvent(eventRow)).to.be.eql({
                "type": "iot.eventType",
                "payload": {
                    "customProperty_1": "payload.customProperty_1",
                    "customProperty_2": "payload.customProperty_2"
                },
                "timestamp": "2016-07-11T14:17:01.359Z"
            });
        });
    });

    context("when the event is a valid one of NEW type", () => {
        it("should handle it and return the converted object", () => {
            let eventRow = {
                "system.blobastext(event)": JSON.stringify({
                    "headers": {
                        "eventId": "headers.eventId",
                        "timestamp": "2016-09-01T10:02:58.504Z"
                    },
                    "payload": {
                        "type": "iot.eventType",
                        "customProperty_1": "payload.customProperty_1",
                        "customProperty_2": "payload.customProperty_2"
                    }
                }),
                "timestamp": new MockTimeStamp("2016-07-11T14:17:01.359Z")
            };

            expect(subject.toEvent(eventRow)).to.be.eql({
                "type": "iot.eventType",
                "payload": {
                    "type": "iot.eventType",
                    "customProperty_1": "payload.customProperty_1",
                    "customProperty_2": "payload.customProperty_2"
                },
                "timestamp": "2016-07-11T14:17:01.359Z"
            });
        });
    });
});
