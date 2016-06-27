import {IObservable, IDisposable} from "rx";
import Event from "../streams/Event";

interface IProjectionHandler<T> extends IObservable<Event<T>>, IDisposable {
    state:T;
    initializeWith(value:T);
    handle(event:Event<T>);
}

export default IProjectionHandler