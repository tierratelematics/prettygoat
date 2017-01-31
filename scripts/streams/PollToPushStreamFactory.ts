import {IStreamFactory} from "./IStreamFactory";
import {injectable, inject, optional} from "inversify";
import {Observable} from "rx";
import {Event} from "./Event";
import {IWhen} from "../projections/IProjection";
import ReservedEvents from "../streams/ReservedEvents";
import {DefaultPollToPushConfig, IPollToPushConfig} from "../configs/PollToPushConfig";

@injectable()
class PollToPushStreamFactory implements IStreamFactory {

    constructor(@inject("StreamFactory") private streamFactory:IStreamFactory,
                @inject("IPollToPushConfig") @optional() private config:IPollToPushConfig = new DefaultPollToPushConfig()) {

    }

    from(lastEvent:Date, completions?:Observable<string>, definition?:IWhen<any>):Observable<Event> {
        return this.streamFactory
            .from(lastEvent, completions, definition)
            .concat(Observable.just({
                type: ReservedEvents.REALTIME,
                payload: null,
                timestamp: null,
                splitKey: null
            }))
            .concat(
                Observable
                    .interval(this.config.interval || 30000)
                    .flatMap(_ => this.streamFactory.from(lastEvent, completions, definition)))
            .do(event => {
                if (event.timestamp)
                    lastEvent = event.timestamp
            });
    }
}

export default PollToPushStreamFactory