import {injectable} from "inversify";
import {values} from "lodash";
import {Subject} from "rx";
import {Event} from "../streams/Event";

export interface IReadModelPublisher {
    publish(event: Event);
}

export interface IReadModelProvider {
    modelFor<T>(projectionName: string): Promise<T>;
}

@injectable()
export class ReadModelFactory implements IReadModelProvider, IReadModelPublisher {

    private subject: Subject<Event> = new Subject<Event>();
    private readModels: Dictionary<Event> = {};  // Caching the read models instead of using a replaySubject because after a while
                                                 // a new subscriber (split projections) could possibly receive thousands of states to process

    publish(event: Event) {
        this.readModels[event.type] = event;
        this.subject.onNext(event);
    }

    modelFor<T>(projectionName: string): Promise<T> {
        return undefined;
    }
}
