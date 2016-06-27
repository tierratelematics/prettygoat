import IReadModelFactory from "./IReadModelFactory";
import {Subject, Observable, Scheduler} from "rx";
import {injectable} from "inversify";
import Dictionary from "../Dictionary";
import Event from "./Event";
import {values} from "lodash";

@injectable()
class ReadModelFactory implements IReadModelFactory {

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
            return Observable.from(readModels).merge(this.subject).observeOn(Scheduler.default);
        else
            return this.subject.observeOn(Scheduler.default);
    }
}

export default ReadModelFactory