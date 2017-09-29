import {inject, injectable} from "inversify";
import {Event} from "../events/Event";
import {Observable} from "rxjs";
import {IStreamFactory, ProjectionQuery} from "../events/IStreamFactory";
import {IIdempotenceFilter} from "../events/IdempotenceFilter";

// NOTE: this class is needed just because at the current moment is really difficult to decorate classes in inversify (respecting the order)

@injectable()
export class ProjectionStreamFactory implements IStreamFactory {

    constructor(@inject("IStreamFactory") private streamFactory: IStreamFactory) {

    }

    from(query: ProjectionQuery, idempotence: IIdempotenceFilter, backpressureGate: Observable<string>): Observable<Event> {
        return this.streamFactory.from(query, idempotence, backpressureGate);
    }
}
