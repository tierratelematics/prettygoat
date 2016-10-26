import {Event} from "./Event";

interface ICassandraDeserializer {
    toEvent(row):Event;
}

export default ICassandraDeserializer;