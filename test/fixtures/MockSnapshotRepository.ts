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

    getSnapshot<T>(streamId:string):Observable<Snapshot<T>> {
        return Observable.just(Snapshot.Empty);
    }

    saveSnapshot<T>(streamId:string, snapshot:Snapshot<T>):void {
    }

}

export default MockSnapshotRepository