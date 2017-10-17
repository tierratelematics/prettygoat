import {Event} from "../events/Event";
import {Observable, Subject} from "rxjs";
import SpecialEvents from "../events/SpecialEvents";
import {inject, injectable} from "inversify";
import {ILogger, NullLogger, LoggingContext} from "inversify-logging";

export interface IReadModelNotifier {
    changes(name: string): Observable<Event>;

    notifyChanged(name: string, timestamp: Date, eventId?: string);
}

@injectable()
@LoggingContext("ReadModelNotifier")
export class ReadModelNotifier implements IReadModelNotifier {

    @inject("ILogger") private logger: ILogger = NullLogger;
    private subject = new Subject<Event>();

    changes(name: string): Observable<Event> {
        return this.subject.filter(event => event.payload === name).sampleTime(100);
    }

    notifyChanged(name: string, timestamp: Date, eventId?: string) {
        let logger = this.logger.createChildLogger(name);
        logger.debug(`Readmodel is changed at timestamp ${timestamp}`);
        this.subject.next({
            type: SpecialEvents.READMODEL_CHANGED,
            payload: name,
            timestamp: timestamp,
            id: eventId
        });
    }
}
