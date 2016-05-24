import {IObservable, IDisposable} from "rx";

interface IProjectionRunner<T> extends IObservable<T>, IDisposable {
    state:T
}

export default IProjectionRunner