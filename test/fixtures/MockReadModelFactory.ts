import {Subject, Observable, Scheduler} from "rx";
import {injectable} from "inversify";
import {values} from "lodash";
import Dictionary from "../../scripts/Dictionary";
import IReadModelFactory from "../../scripts/streams/IReadModelFactory";
import Event from "../../scripts/streams/Event";

@injectable()
class MockReadModelFactory implements IReadModelFactory {

    private subject:Subject<Event<any>>;
    private readModels:Dictionary<Event<any>> = {};  // Caching the read models instead of using a replaySubject because after a while
                                                // a new subscriber (split projections) could possibly receive thousands of states to process

    constructor() {
        this.subject = new Subject<Event<any>>();
    }

    publish(event:Event<any>):void {
        this.readModels[event.type] = event;
        this.subject.onNext(event);
    }

    from(lastEvent:string):Rx.Observable<Event<any>> {
        let readModels = values<Event<any>>(this.readModels);
        if (readModels.length)
            return Observable.from(readModels).merge(this.subject);
        else
            return this.subject;
    }
}

export default MockReadModelFactory