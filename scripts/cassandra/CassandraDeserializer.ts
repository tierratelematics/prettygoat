import {injectable} from "inversify";
import {Event} from "../streams/Event";
import IEventDeserializer from "../streams/IEventDeserializer";

@injectable()
class CassandraDeserializer implements IEventDeserializer {

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
