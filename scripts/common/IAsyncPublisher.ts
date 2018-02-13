import {Observable} from "rxjs";

interface IAsyncPublisher<T> {
    publish(item: T);
    items(grouping?: (item: T) => string | string[]): Observable<T>;
}

export default IAsyncPublisher
