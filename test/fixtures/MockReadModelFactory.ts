import {Subject, Observable, Scheduler} from "rx";
import {injectable} from "inversify";
import {values} from "lodash";
import Dictionary from "../../scripts/Dictionary";
import IReadModelFactory from "../../scripts/streams/IReadModelFactory";
import Event from "../../scripts/streams/Event";

@injectable()
class MockReadModelFactory implements IReadModelFactory {

    private subject:Subject<Event>;
    private readModels:Dictionary<Event> = {};  // Caching the read models instead of using a replaySubject because after a while
                                                // a new subscriber (split projections) could possibly receive thousands of states to process

    constructor() {
        this.subject = new Subject<Event>();
    }

    publish(event:Event):void {
        this.readModels[event.type] = event;
        this.subject.onNext(event);
    }

    from(lastEvent:string):Rx.Observable<Event> {
        let readModels = values<Event>(this.readModels);
        if (readModels.length)
            return Observable.from(readModels).merge(this.subject);
        else
            return this.subject;
    }
}

export default MockReadModelFactory