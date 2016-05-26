export class Snapshot<T> {
    public static Empty: Snapshot<any> = new Snapshot<any>(undefined, undefined);
    constructor(public memento: T, public lastEvent: string) {}
}

export interface ISnapshotRepository {
    getSnapshot<T>(streamId: string): Snapshot<T>;
    saveSnapshot<T>(streamId: string, snapshot: Snapshot<T>): void;
}
