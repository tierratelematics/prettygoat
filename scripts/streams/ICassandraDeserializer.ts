import {Event} from "./Event";

interface ICassandraDeserializer {
    toEvent(row:any):Event;
}

export default ICassandraDeserializer;