import IReadModelFactory from "./IReadModelFactory";
import {Subject, ReplaySubject} from "rx";
import Event from "./Event";

class ReadModelFactory implements IReadModelFactory {

    private subject:Subject<Event>;

    constructor() {
        this.subject = new ReplaySubject<Event>();
    }

    publish(event:Event):void {
        this.subject.onNext(event);
    }

    from(lastEvent:string):Rx.Observable<Event> {
        return this.subject;
    }
}

export default ReadModelFactory