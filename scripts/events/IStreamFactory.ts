import {Observable} from "rxjs";
import {Event} from "./Event";
import {IIdempotenceFilter} from "./IdempotenceFilter";

export type ProjectionQuery = {
    name: string;
    manifests: string[];
    from?: Date;
    to?: Date;
}

export interface IStreamFactory {
    from(query?: ProjectionQuery, idempotence?: IIdempotenceFilter, backpressureGate?: Observable<string>): Observable<Event>;
}
