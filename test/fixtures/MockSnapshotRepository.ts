import {ISnapshotRepository, Snapshot} from "../../scripts/snapshots/ISnapshotRepository";
import {Observable} from "rx";
import Dictionary from "../../scripts/Dictionary";

class MockSnapshotRepository implements ISnapshotRepository {

    initialize():Rx.Observable<void> {
        return Observable.just(null);
    }

    getSnapshots():Observable<Dictionary<Snapshot<any>>> {
        return undefined;
    }

    getSnapshot<T>(streamId: string): Rx.Observable<Snapshot<T>> {
        return undefined;
    }

    saveSnapshot<T>(streamId:string, snapshot:Snapshot<T>):void {
    }

    deleteSnapshot(streamId:string):void {
    }

}

export default MockSnapshotRepository