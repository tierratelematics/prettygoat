import {Snapshot, ISnapshotRepository} from "./ISnapshotRepository";
import {injectable} from "inversify";

@injectable()
class SnapshotRepository implements ISnapshotRepository {

    getSnapshot<T>(streamId:string):Snapshot<T> {
        return Snapshot.Empty;
    }

    saveSnapshot<T>(streamId:string, snapshot:Snapshot<T>):void {
    }

}

export default SnapshotRepository