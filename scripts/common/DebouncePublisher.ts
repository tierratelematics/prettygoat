import IAsyncPublisher from "./IAsyncPublisher";
import {Subject, Observable} from "rxjs";
import {injectable} from "inversify";

@injectable()
class DebouncePublisher<T> implements IAsyncPublisher<T> {

    private subject = new Subject<T>();

    publish(item: T) {
        this.subject.next(item);
    }

    items(): Observable<T> {
        return this.subject.debounceTime(10000);
    }

}

export default DebouncePublisher
