import {Observable, IDisposable} from "rx";
import {Snapshot} from "../snapshots/ISnapshotRepository";
import ProjectionStats from "./ProjectionStats";
import {Event} from "../events/Event";

export interface IProjectionRunner<T> extends IDisposable {
    state: T;
    stats: ProjectionStats;
    run(snapshot?: Snapshot<T>): void;
    stop(): void;
    notifications(): Observable<Event<T>>;
}
