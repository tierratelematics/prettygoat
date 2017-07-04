import {Event} from "../events/Event";
import {Observable, Subject} from "rxjs";
import SpecialEvents from "../events/SpecialEvents";

export interface IReadModelNotifier {
    changes(name: string): Observable<Event>;
    notifyChanged(name: string, timestamp: Date);
}

export class ReadModelNotifier implements IReadModelNotifier {

    private subject = new Subject<Event>();

    changes(name: string): Observable<Event> {
        return this.subject.filter(event => event.payload === name).sampleTime(100);
    }

    notifyChanged(name: string, timestamp: Date) {
        this.subject.next({
            type: SpecialEvents.READMODEL_CHANGED,
            payload: name,
            timestamp: timestamp
        });
    }
}
