import {IObservable, IDisposable} from "rx";
import Event from "../streams/Event";

interface IProjectionRunner<T> extends IObservable<Event>, IDisposable {
    state:T;
    run():void;
    stop():void;
}

export default IProjectionRunner