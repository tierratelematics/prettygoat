import IReadModelFactory from "../../scripts/streams/IReadModelFactory";
import {Subject} from "rx";
import Event from "../../scripts/streams/Event";

class MockReadModelFactory implements IReadModelFactory {

    constructor(private subject:Subject<Event>) {

    }

    publish(event:Event):void {

    }

    from(lastEvent:string):Rx.Observable<Event> {
        return this.subject;
    }

}

export default MockReadModelFactory