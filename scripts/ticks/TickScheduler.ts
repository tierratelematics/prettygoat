import ITickScheduler from "./ITickScheduler";
import {injectable, inject} from "inversify";
import {Subject, ReplaySubject, Observable} from "rx";
import Tick from "./Tick";
import {Event} from "../streams/Event";
import * as moment from "moment";
import IDateRetriever from "../util/IDateRetriever";
import ReservedEvents from "../streams/ReservedEvents";

@injectable()
class TickScheduler implements ITickScheduler {

    private subject = new ReplaySubject<Event>();

    constructor(@inject("IDateRetriever") private dateRetriever:IDateRetriever) {

    }

    schedule(dueTime:number|Date, state?:string, splitKey?:string) {
        let dueDate = dueTime instanceof Date ? dueTime : this.calculateDueDate(<number>dueTime);
        this.subject.onNext({
            type: ReservedEvents.TICK,
            payload: new Tick(dueDate, state),
            timestamp: dueDate,
            splitKey: splitKey
        });
    }

    from(lastEvent:Date):Observable<Event> {
        return this.subject;
    }

    private calculateDueDate(dueTime:number):Date {
        return moment(this.dateRetriever.getDate()).add(dueTime, 'milliseconds').toDate();
    }
}

export default TickScheduler