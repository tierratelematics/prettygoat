import {Observable} from "rxjs";
import {ISubscription} from "rxjs/Subscription";
import {Snapshot} from "../snapshots/ISnapshotRepository";
import {Event} from "../events/Event";
import {ProjectionStats} from "./ProjectionRunner";

export interface IProjectionRunner<T = any> extends ISubscription {
    state: T;
    stats: ProjectionStats;
    run(snapshot?: Snapshot<T>): void;
    stop(): void;
    notifications(): Observable<[Event<T>, Dictionary<string[]>]>;
}
