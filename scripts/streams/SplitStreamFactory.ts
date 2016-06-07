import {IStreamFactory} from "../../scripts/streams/IStreamFactory";
import {Observable} from "rx";

class SplitStreamFactory implements IStreamFactory {

    constructor(private observable?:Observable<any>) {

    }

    from(lastEvent:string):Observable<any> {
        return this.observable;
    }
}

export default SplitStreamFactory