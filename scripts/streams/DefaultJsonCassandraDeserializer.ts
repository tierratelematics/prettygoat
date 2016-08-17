import {injectable, inject} from "inversify";
import ICassandraDeserializer from "./ICassandraDeserializer";
import Event from "./Event";

@injectable()
class DefaultJsonCassandraDeserializer implements ICassandraDeserializer {

  toEvent(row: any): Event {

      let parsed = JSON.parse(row['system.blobastext(event)']);
      return {
          type: parsed.type,
          payload: parsed.payload,
          timestamp: row.timestamp.getDate().toISOString()
      };
  }
}

export default DefaultJsonCassandraDeserializer;