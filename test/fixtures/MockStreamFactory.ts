import {IStreamFactory} from "../../scripts/streams/IStreamFactory";
import {Observable} from "rx";
import Event from "../../scripts/streams/Event";

export class MockStreamFactory implements IStreamFactory {

    constructor(private observable?:Observable<Event<any>>) {

    }

    from(lastEvent:string):Observable<Event<any>> {
        return this.observable;
    }
}
