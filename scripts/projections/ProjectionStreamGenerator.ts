import {Snapshot} from "../snapshots/ISnapshotRepository";
import {inject, injectable} from "inversify";
import {Event} from "../events/Event";
import {Observable} from "rxjs";
import {IProjection} from "./IProjection";
import {IStreamFactory} from "../events/IStreamFactory";

export interface IProjectionStreamGenerator {
    generate(projection: IProjection<any>, snapshot: Snapshot<any>, completions: Observable<any>): Observable<Event>;
}

@injectable()
export class ProjectionStreamGenerator implements IProjectionStreamGenerator {

    constructor(@inject("IStreamFactory") private streamFactory: IStreamFactory) {

    }

    generate(projection: IProjection<any>, snapshot: Snapshot<any>, completions: Observable<any>): Observable<Event> {
        return this.streamFactory.from(snapshot ? snapshot.lastEvent : null, completions, projection.definition);
    }
}
