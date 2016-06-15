import {IStreamFactory} from "./IStreamFactory";
import {injectable, inject} from "inversify";
import IPollToPushConfig from "../configs/IPollToPushConfig";
import * as Rx from "rx";
import Event from "./Event";

@injectable()
class PollToPushStreamFactory implements IStreamFactory {

    private source:Rx.Observable<any>;

    constructor(@inject("StreamFactory") streamFactory:IStreamFactory,
                @inject("IPollToPushConfig") config:IPollToPushConfig) {
        this.source = streamFactory
            .from(null)
            .concat(
                Rx.Observable
                    .interval(config.interval || 30000)
                    .flatMap(_ => streamFactory.from(null)))
            .share();
    }

    from(lastEvent:string):Rx.Observable<Event> {
        return this.source;
    }
}

export default PollToPushStreamFactory