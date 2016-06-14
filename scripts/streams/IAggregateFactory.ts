import {IStreamFactory} from "./IStreamFactory";
import Event from "./Event";

interface IAggregateFactory extends IStreamFactory {
    publish(event:Event):void;
}

export default IAggregateFactory