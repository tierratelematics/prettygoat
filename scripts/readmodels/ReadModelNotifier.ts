import {Event} from "../events/Event";
import {Observable, Subject} from "rxjs";
import SpecialEvents from "../events/SpecialEvents";
import {inject, injectable} from "inversify";
import { IAsyncPublisherFactory } from "../common/AsyncPublisherFactory";
import IAsyncPublisher from "../common/IAsyncPublisher";
import Dictionary from "../common/Dictionary";
import { IProjectionRunner } from "../projections/IProjectionRunner";
import {chain, last} from "lodash";

export type ReadModelNotification = [Event, string[]];

export interface IReadModelNotifier {
    changes(name: string): Observable<ReadModelNotification>;

    notifyChanged(event: Event, contexts: string[]);
}

@injectable()
export class ReadModelNotifier implements IReadModelNotifier {

    private subject = new Subject<ReadModelNotification>();

    changes(name: string): Observable<ReadModelNotification> {
        return this.subject
            .filter(data => data[0].payload === name)
            .bufferTime(100)
            .map(buffer => {
                if (!buffer.length) return null;
                let keys = chain(buffer).map(item => item[1]).flatten().uniq().valueOf();
                return [last(buffer)[0], keys] as ReadModelNotification;
            })
            .filter(data => !!data);
    }

    notifyChanged(event: Event, contexts: string[]) {
        this.subject.next([{
            type: SpecialEvents.READMODEL_CHANGED,
            payload: event.type,
            timestamp: event.timestamp,
            id: event.id,
            metadata: event.metadata
        }, contexts]);
    }
}
