import ICassandraDeserializer from "../../../scripts/cassandra/ICassandraDeserializer";
import {Event} from "../../../scripts/streams/Event";

export default class MockCassandraDeserializer implements ICassandraDeserializer {
    toEvent(row):Event {
        return row;
    }

}