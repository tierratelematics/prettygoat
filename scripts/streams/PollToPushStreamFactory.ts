import {IStreamFactory} from "./IStreamFactory";
import {injectable, inject} from "inversify";
import IPollToPushConfig from "../configs/IPollToPushConfig";
import * as Rx from "rx";
import {Event} from "./Event";

@injectable()
class PollToPushStreamFactory implements IStreamFactory {

    constructor(@inject("StreamFactory") private streamFactory:IStreamFactory,
                @inject("IPollToPushConfig") private config:IPollToPushConfig) {

    }

    from(lastEvent:Date, events?:string[]):Rx.Observable<Event> {
        return this.streamFactory
            .from(lastEvent, events)
            .concat(
                Rx.Observable
                    .interval(this.config.interval || 30000)
                    .flatMap(_ => this.streamFactory.from(lastEvent, events)))
            .do(event => {
                if (event.timestamp)
                    lastEvent = event.timestamp
            })
            .observeOn(Rx.Scheduler.default);
    }
}

export default PollToPushStreamFactory