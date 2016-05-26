import {IObservable, IDisposable} from "rx";

interface IProjectionRunner<T> extends IObservable<T>, IDisposable {
    state:T;
    run():void;
    stop():void;
}

export default IProjectionRunner