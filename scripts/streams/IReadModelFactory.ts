import {Event} from "./Event";
import {IEventsStream} from "./IEventsStream";

interface IReadModelFactory extends IEventsStream {
    publish(event:Event):void;
}

export default IReadModelFactory