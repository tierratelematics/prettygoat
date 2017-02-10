import {Observable} from "rx";

interface IAsyncPublisher<T> {
    publish(item: T);
    items(): Observable<T>;
}

export default IAsyncPublisher