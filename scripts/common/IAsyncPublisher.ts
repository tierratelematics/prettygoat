import {Observable} from "rxjs";

interface IAsyncPublisher<T> {
    publish(item: T);
    items(grouping?: (item: T) => string | string[]): Observable<T>;
    bufferedItems(grouping?: (item: T) => string | string[]): Observable<[T, string[]]>;
}

export default IAsyncPublisher
