import {Observable} from "rxjs";

interface IAsyncPublisher<T> {
    publish(item: T);
    items(): Observable<T>;
}

export default IAsyncPublisher