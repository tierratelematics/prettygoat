import {Event} from "./Event";

interface IEventDeserializer {
    toEvent(row):Event;
}

export default IEventDeserializer;