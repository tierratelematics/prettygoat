import {RingBufferItem} from "../events/IdempotenceFilter";

export class Snapshot<T = any> {
    public static Empty: Snapshot<any> = new Snapshot<any>(undefined, undefined, []);

    constructor(public memento: T | { state: T }, public lastEvent: Date, public ringBuffer: RingBufferItem[] = []) {
    }
}

export interface ISnapshotRepository {
    getSnapshot<T>(name: string): Promise<Snapshot<T>>;

    saveSnapshot<T>(name: string, snapshot: Snapshot<T>): Promise<void>;

    deleteSnapshot(name: string): Promise<void>;
}
