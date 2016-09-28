import {Subject} from "rx";
import {injectable} from "inversify";
import IReadModelFactory from "../../scripts/streams/IReadModelFactory";
import {Event} from "../../scripts/streams/Event";

@injectable()
class MockReadModelFactory implements IReadModelFactory {

    private subject:Subject<Event>;

    constructor() {
        this.subject = new Subject<Event>();
    }

    publish(event:Event):void {
        this.subject.onNext(event);
    }

    from(lastEvent:string):Rx.Observable<Event> {
        return this.subject;
    }
}

export default MockReadModelFactory