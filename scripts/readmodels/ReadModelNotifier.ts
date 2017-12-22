import {Event} from "../events/Event";
import {Observable} from "rxjs";
import SpecialEvents from "../events/SpecialEvents";
import {inject, injectable} from "inversify";
import { IAsyncPublisherFactory } from "../common/AsyncPublisherFactory";
import IAsyncPublisher from "../common/IAsyncPublisher";
import Dictionary from "../common/Dictionary";
import { IProjectionRunner } from "../projections/IProjectionRunner";

export type ReadModelNotification = [Event, string[]];

export interface IReadModelNotifier {
    changes(name: string): Observable<ReadModelNotification>;

    notifyChanged(event: Event, contexts: string[]);
}

@injectable()
export class ReadModelNotifier implements IReadModelNotifier {

    private publishers: Dictionary<IAsyncPublisher<ReadModelNotification>> = {};

    constructor(@inject("IAsyncPublisherFactory") private asyncPublisherFactory: IAsyncPublisherFactory,
                @inject("IProjectionRunnerHolder") private runners: Dictionary<IProjectionRunner>) {
        
    }

    changes(name: string): Observable<ReadModelNotification> {
        let publisher = this.publisherFor(name);
        return publisher.bufferedItems(item => item[1]).map(notification => <ReadModelNotification>[notification[0][0], notification[1]]);
    }

    notifyChanged(event: Event, contexts: string[]) {
        let publisher = this.publisherFor(event.type);
        publisher.publish([{
            type: SpecialEvents.READMODEL_CHANGED,
            payload: event.type,
            timestamp: event.timestamp,
            id: event.id,
            metadata: event.metadata
        }, contexts]);
    }

    private publisherFor(readmodel: string): IAsyncPublisher<ReadModelNotification> {
        let publisher = this.publishers[readmodel];
        if (!publisher) {
            let runner = this.runners[readmodel];
            publisher = this.publishers[readmodel] = this.asyncPublisherFactory.publisherFor(runner);
        }
        
        return publisher;
    }
}
