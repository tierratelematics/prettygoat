import {IObservable, IDisposable} from "rx";
import NotificationState from "../push/NotificationState";
import {Snapshot} from "../snapshots/ISnapshotRepository";
import Event from "../streams/Event";

interface IProjectionRunner<T> extends IObservable<NotificationState<T>>, IDisposable {
    state:T;
    initializeWith(value:T);
    handle(event:Event);
}

export default IProjectionRunner