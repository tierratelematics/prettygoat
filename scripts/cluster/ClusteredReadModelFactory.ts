import IReadModelFactory from "../streams/IReadModelFactory";
import {IWhen} from "../projections/IProjection";
import {inject} from "inversify";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import ICluster from "./ICluster";
import IProjectionSorter from "../projections/IProjectionSorter";
import {Event} from "../streams/Event";
import {Observable} from "rx";

class ClusteredReadModelFactory implements IReadModelFactory {

    constructor(@inject("ReadModelFactory") private readModelFactory: IReadModelFactory,
                @inject("IProjectionRegistry") private registry:IProjectionRegistry,
                @inject("ICluster") private cluster:ICluster,
                @inject("IProjectionSorter") private sorter:IProjectionSorter) {

    }

    publish(event: Event): void {

    }

    from(lastEvent: Date, completions?: Rx.Observable<string>, definition?: IWhen<any>): Observable<Event> {
        return undefined;
    }

    asList(): any[] {
        return undefined;
    }
}

export default ClusteredReadModelFactory