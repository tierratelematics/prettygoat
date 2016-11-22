import IReadModelFactory from "./IReadModelFactory";
import {Subject, Observable, Scheduler} from "rx";
import {injectable,inject} from "inversify";
import Dictionary from "../Dictionary";
import {Event} from "./Event";
import {values} from "lodash";
import * as _ from "lodash";
import {IWhen} from "../projections/IProjection";
import IProjectionRegistry from "../registry/IProjectionRegistry";

@injectable()
class ReadModelFactory implements IReadModelFactory {

    private subject:Subject<Event>;
    private readModels:Dictionary<Event> = {};  // Caching the read models instead of using a replaySubject because after a while
                                                // a new subscriber (split projections) could possibly receive thousands of states to process

    constructor(@inject("IProjectionRegistry") private registry:IProjectionRegistry) {
        this.subject = new Subject<Event>();
    }

    publish(event:Event):void {
        this.readModels[event.type] = event;
        this.subject.onNext(event);
    }

    from(lastEvent:Date,definition:IWhen<any>):Rx.Observable<Event> {
        let readModels = values<Event>(this.readModels);
        let dependencies = this.getDependenciesFor(definition);
        return Observable.from(readModels).concat(this.subject).filter(event => _.includes(dependencies, event.type));
    }

    private getDependenciesFor(definition:IWhen<any>):string[]{
        return _(definition)
            .keys()
            .filter(projection => this.registry.getEntry(projection, null).data != null)
            .valueOf();
    }
}

export default ReadModelFactory