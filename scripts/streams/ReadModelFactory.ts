import IReadModelFactory from "./IReadModel";
import {Subject, Observable} from "rx";
import {injectable} from "inversify";
import Dictionary from "../util/Dictionary";
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

    asList():any[] {
        return values<Event>(this.readModels);
    }

    from(lastEvent:Date):Observable<Event> {
        return Observable.from(this.asList()).concat(this.subject);
    }
}

export default ReadModelFactory