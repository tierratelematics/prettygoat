import ITickScheduler from "./ITickScheduler";
import {injectable, inject} from "inversify";
import {ReplaySubject, Observable} from "rxjs";
import Tick from "./Tick";
import * as moment from "moment";
import IDateRetriever from "../common/IDateRetriever";
import SpecialEvents from "../events/SpecialEvents";
import {Event} from "../events/Event";

@injectable()
class TickScheduler implements ITickScheduler {

    private subject = new ReplaySubject<Event>();

    constructor(@inject("IDateRetriever") private dateRetriever: IDateRetriever) {

    }

    schedule(dueTime: number | Date, state?: string) {
        let dueDate = dueTime instanceof Date ? dueTime : this.calculateDueDate(<number>dueTime);
        this.subject.next({
            type: SpecialEvents.TICK,
            payload: new Tick(dueDate, state),
            timestamp: dueDate
        });
    }

    from(lastEvent: Date): Observable<Event> {
        return this.subject;
    }

    private calculateDueDate(dueTime: number): Date {
        return moment(this.dateRetriever.getDate()).add(dueTime, "milliseconds").toDate();
    }
}

export default TickScheduler
