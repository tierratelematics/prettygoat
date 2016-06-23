import {IStreamFactory} from "./IStreamFactory";
import {injectable, inject} from "inversify";
import IPollToPushConfig from "../configs/IPollToPushConfig";
import * as Rx from "rx";
import Event from "./Event";

@injectable()
class PollToPushStreamFactory implements IStreamFactory {

    constructor(@inject("StreamFactory") private streamFactory:IStreamFactory,
                @inject("IPollToPushConfig") private config:IPollToPushConfig) {

    }

    from(lastEvent:string):Rx.Observable<Event> {
        return this.streamFactory
            .from(null)
            .concat(
                Rx.Observable
                    .interval(this.config.interval || 30000)
                    .flatMap(_ => this.streamFactory.from(null)))
            .observeOn(Rx.Scheduler.default);
    }
}

export default PollToPushStreamFactory