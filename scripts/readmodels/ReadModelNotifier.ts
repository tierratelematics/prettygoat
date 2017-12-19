import {Event} from "../events/Event";
import {Observable} from "rxjs";
import SpecialEvents from "../events/SpecialEvents";
import {inject, injectable} from "inversify";
import { IAsyncPublisherFactory } from "../common/AsyncPublisherFactory";
import IAsyncPublisher from "../common/IAsyncPublisher";
import Dictionary from "../common/Dictionary";
import { IProjectionRunner } from "../projections/IProjectionRunner";

export interface IReadModelNotifier {
    changes(name: string): Observable<[Event, string]>;

    notifyChanged(event: Event, context: string);
}

@injectable()
export class ReadModelNotifier implements IReadModelNotifier {

    private publishers: Dictionary<IAsyncPublisher<any>> = {};

    constructor(@inject("IAsyncPublisherFactory") private asyncPublisherFactory: IAsyncPublisherFactory,
                @inject("IProjectionRunnerHolder") private runners: Dictionary<IProjectionRunner>) {
        
    }

    changes(name: string): Observable<[Event, string]> {
        let publisher = this.publisherFor(name);
        return publisher.items(item => item[1]);
    }

    notifyChanged(event: Event, context: string) {
        let publisher = this.publisherFor(event.type);
        publisher.publish([{
            type: SpecialEvents.READMODEL_CHANGED,
            payload: event.type,
            timestamp: event.timestamp,
            id: event.id,
            metadata: event.metadata
        }, context]);
    }

    private publisherFor(readmodel: string): IAsyncPublisher<[Event, string]> {
        let publisher = this.publishers[readmodel];
        if (!publisher) {
            let runner = this.runners[readmodel];
            publisher = this.publishers[readmodel] = this.asyncPublisherFactory.publisherFor(runner);
        }
        
        return publisher;
    }
}
