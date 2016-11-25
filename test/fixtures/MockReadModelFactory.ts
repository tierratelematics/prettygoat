import {Subject} from "rx";
import {injectable} from "inversify";
import IReadModelFactory from "../../scripts/streams/IReadModelFactory";
import {Event} from "../../scripts/streams/Event";
import {IWhen} from "../../scripts/projections/IProjection";

@injectable()
class MockReadModelFactory implements IReadModelFactory {

    private subject:Subject<Event>;

    constructor() {
        this.subject = new Subject<Event>();
    }

    publish(event:Event):void {
        this.subject.onNext(event);
    }

    from(lastEvent: Date, completions?: Rx.Observable<void>, definition?: IWhen<any>): Rx.Observable<Event> {
        return this.subject;
    }

}

export default MockReadModelFactory