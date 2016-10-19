import {Observable, IDisposable} from "rx";
import {Event} from "../streams/Event";
import Dictionary from "../Dictionary";
import {Snapshot} from "../snapshots/ISnapshotRepository";

interface IProjectionRunner<T> extends IDisposable {
    state:T|Dictionary<T>;
    run(snapshot?:Snapshot<T|Dictionary<T>>):void;
    stop():void;
    notifications():Observable<Event>;
}

export default IProjectionRunner