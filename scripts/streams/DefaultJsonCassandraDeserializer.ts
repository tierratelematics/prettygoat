import {injectable} from "inversify";
import ICassandraDeserializer from "./ICassandraDeserializer";
import Event from "./Event";

@injectable()
class DefaultJsonCassandraDeserializer implements ICassandraDeserializer {
    toEvent(row: any): Event {
        console.log(row);
        let parsedEvent = JSON.parse(row["system.blobastext(event)"]);

        if (this.isNewEventType(parsedEvent)) {
            return {
                type: parsedEvent.payload.type,
                payload: parsedEvent.payload,
                timestamp: row.timestamp.getDate().toISOString()
            };
        }

        return {
            type: parsedEvent.type,
            payload: parsedEvent.payload,
            timestamp: row.timestamp.getDate().toISOString()
        };
    }

    private isNewEventType(event: any): boolean {
        return (event.headers && event.payload && event.payload.type);
    }
}

export default DefaultJsonCassandraDeserializer;
