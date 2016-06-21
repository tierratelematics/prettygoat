import {IStreamFactory} from "../../scripts/streams/IStreamFactory";
import {Observable} from "rx";
import Event from "../events/Event";

class SplitStreamFactory implements IStreamFactory {

    constructor(private observable?:Observable<Event>) {

    }

    from(lastEvent:string):Observable<Event> {
        return this.observable;
    }
}

export default SplitStreamFactory