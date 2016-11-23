import IReadModelFactory from "./IReadModelFactory";
import {Subject, Observable, Scheduler} from "rx";
import {injectable} from "inversify";
import Dictionary from "../Dictionary";
import {Event} from "./Event";
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

    stream():Rx.Observable<Event> {
        let readModels = values<Event>(this.readModels);
        return Observable.from(readModels).concat(this.subject);
    }
}

export default ReadModelFactory