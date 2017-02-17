import {Event} from "../../scripts/streams/Event";
import IEventDeserializer from "../../scripts/streams/IEventDeserializer";

export default class MockEventDeserializer implements IEventDeserializer {
    toEvent(row):Event {
        return row;
    }

}