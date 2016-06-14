import IAggregateFactory from "./IAggregateFactory";
import Event from "./Event";

class AggregateFactory implements IAggregateFactory {

    publish(event:Event):void {
        
    }

    from(lastEvent:string):Rx.Observable<Event> {
        return undefined;
    }
}

export default AggregateFactory