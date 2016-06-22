import {IObservable, IDisposable} from "rx";
import NotificationState from "../push/NotificationState";

interface IProjectionRunner<T> extends IObservable<NotificationState<T>>, IDisposable {
    state:T;
    run():void;
    stop():void;
}

export default IProjectionRunner