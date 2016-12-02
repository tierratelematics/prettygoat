import {IStreamFactory} from "./IStreamFactory";
import {injectable, inject} from "inversify";
import IPollToPushConfig from "../configs/IPollToPushConfig";
import {Scheduler, Observable} from "rx";
import {Event} from "./Event";
import {IWhen} from "../projections/IProjection";
import ReservedEvents from "../streams/ReservedEvents";

@injectable()
class PollToPushStreamFactory implements IStreamFactory {

    constructor(@inject("StreamFactory") private streamFactory:IStreamFactory,
                @inject("IPollToPushConfig") private config:IPollToPushConfig) {

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