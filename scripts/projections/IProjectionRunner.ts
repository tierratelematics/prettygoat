import {IObservable, IDisposable} from "rx";
import Event from "../streams/Event";
import Dictionary from "../Dictionary";

interface IProjectionRunner<T> extends IObservable<Event>, IDisposable {
    state:T|Dictionary<T>;
    run():void;
    stop():void;
}

export default IProjectionRunner