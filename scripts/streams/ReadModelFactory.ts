import IReadModelFactory from "./IReadModelFactory";
import Event from "./Event";

class ReadModelFactory implements IReadModelFactory {

    publish(event:Event):void {
        
    }

    from(lastEvent:string):Rx.Observable<Event> {
        return undefined;
    }
}

export default ReadModelFactory