import {IObservable, IDisposable} from "rx";
import Event from "../streams/Event";
import Dictionary from "../Dictionary";
import {Snapshot} from "../snapshots/ISnapshotRepository";

interface IProjectionRunner<T> extends IObservable<Event>, IDisposable {
    state:T|Dictionary<T>;
    run(snapshot?:Snapshot<T|Dictionary<T>>):void;
    stop():void;
}

export default IProjectionRunner