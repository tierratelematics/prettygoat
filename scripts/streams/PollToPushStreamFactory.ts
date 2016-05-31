import {IStreamFactory} from "./IStreamFactory";
import {injectable, inject} from "inversify";
import IPollToPushConfig from "../configs/IPollToPushConfig";
import * as Rx from "rx";

@injectable()
class PollToPushStreamFactory implements IStreamFactory {

    private source:Rx.Observable<any>;
    
    constructor(@inject("StreamFactory") streamFactory:IStreamFactory,
                @inject("IPollToPushConfig") config:IPollToPushConfig) {
        this.source = Rx.Observable.interval(config.interval || 30000).flatMap(_ => streamFactory.from(null)).share();
    }

    from(lastEvent:string):Rx.Observable<any> {
        return this.source;
    }
}

export default PollToPushStreamFactory