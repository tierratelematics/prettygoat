import {Observable} from "rx";
import Dictionary from "../Dictionary";

export class Snapshot<T> {
    public static Empty:Snapshot<any> = new Snapshot<any>(undefined, undefined);

    constructor(public memento:T, public lastEvent:Date) {
    }
}

export interface ISnapshotRepository {
    initialize():Observable<void>;
    getSnapshots():Observable<Dictionary<Snapshot<any>>>;
    getSnapshot<T>(streamId:string):Observable<Snapshot<T>>;
    saveSnapshot<T>(streamId:string, snapshot:Snapshot<T>):void;
    deleteSnapshot(streamId:string):void;
}
