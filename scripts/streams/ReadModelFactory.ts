import IReadModelFactory from "./IReadModelFactory";
import {Subject, Observable} from "rx";
import {injectable} from "inversify";
import Dictionary from "../Dictionary";
import Event from "./Event";
import {values} from "lodash";

@injectable()
class ReadModelFactory implements IReadModelFactory {

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

export default ReadModelFactory