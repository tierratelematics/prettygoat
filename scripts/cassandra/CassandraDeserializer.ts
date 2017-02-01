import {injectable} from "inversify";
import ICassandraDeserializer from "./ICassandraDeserializer";
import {Event} from "../streams/Event";

@injectable()
class CassandraDeserializer implements ICassandraDeserializer {

    toEvent(row):Event {
        let parsedEvent = JSON.parse(row.event);

        if (this.isNewEventType(parsedEvent)) {
            return {
                type: parsedEvent.payload.$manifest,
                payload: parsedEvent.payload,
                timestamp: row.timestamp.getDate(),
                splitKey: null
            };
        }

        return {
            type: parsedEvent.type,
            payload: parsedEvent.payload,
            timestamp: row.timestamp.getDate(),
            splitKey: null
        };
    }

    private isNewEventType(event):boolean {
        return (event.payload && event.payload.$manifest);
    }
}

export default CassandraDeserializer;
