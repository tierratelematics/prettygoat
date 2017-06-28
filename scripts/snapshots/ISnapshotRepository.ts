import {Observable} from "rx";

export class Snapshot<T> {
    public static Empty: Snapshot<any> = new Snapshot<any>(undefined, undefined);

    constructor(public memento: T, public lastEvent: Date) {
    }
}

export interface ISnapshotRepository {
    getSnapshot<T>(name: string): Observable<Snapshot<T>>;
    saveSnapshot<T>(name: string, snapshot: Snapshot<T>): Observable<void>;
    deleteSnapshot(name: string): Observable<void>;
}
