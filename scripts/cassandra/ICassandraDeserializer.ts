import {Event} from "../streams/Event";

interface ICassandraDeserializer {
    toEvent(row):Event;
}

export default ICassandraDeserializer;