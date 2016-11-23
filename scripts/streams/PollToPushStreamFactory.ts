import {IStreamFactory} from "./IStreamFactory";
import {injectable, inject} from "inversify";
import IPollToPushConfig from "../configs/IPollToPushConfig";
import {Observable} from "rx";
import {Event} from "./Event";
import {IWhen} from "../projections/IProjection";
import ReservedEvents from "../streams/ReservedEvents";
import * as _ from "lodash";

@injectable()
class PollToPushStreamFactory implements IStreamFactory {

    constructor(@inject("StreamFactory") private streamFactory:IStreamFactory,
                @inject("IPollToPushConfig") private config:IPollToPushConfig) {

    }

    from(timestamp:Date, completions?:Observable<void>, definition?:IWhen<any>):Observable<Event[]> {
        return this.streamFactory
            .from(timestamp, completions, definition)
            .concat(Observable.just([{
                type: ReservedEvents.REALTIME,
                payload: null,
                timestamp: null,
                splitKey: null
            }]))
            .concat(
                Observable
                    .interval(this.config.interval || 30000)
                    .flatMap(_ => this.streamFactory.from(timestamp, completions, definition)))
            .do(events => {
                let lastEvent = _.last(events);
                if (lastEvent && lastEvent.timestamp)
                    timestamp = lastEvent.timestamp;
            });
    }
}

export default PollToPushStreamFactory