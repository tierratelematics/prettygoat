import {injectable} from "inversify";
import ICassandraDeserializer from "./ICassandraDeserializer";
import {Event} from "../streams/Event";

@injectable()
class CassandraDeserializer implements ICassandraDeserializer {

    toEvent(row): Event {
        let parsedEvent = JSON.parse(row.event);

        return {
            type: parsedEvent.payload.$manifest,
            payload: parsedEvent.payload,
            timestamp: row.timestamp.getDate(),
            splitKey: null
        };
    }
}

export default CassandraDeserializer;
