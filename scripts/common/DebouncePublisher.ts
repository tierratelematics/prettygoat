import IAsyncPublisher from "./IAsyncPublisher";
import {Subject, Observable} from "rx";
import {injectable} from "inversify";

@injectable()
class DebouncePublisher<T> implements IAsyncPublisher<T> {

    private subject = new Subject<T>();

    publish(item: T) {
        this.subject.onNext(item);
    }

    items(): Observable<T> {
        return this.subject.debounce(10000);
    }

}

export default DebouncePublisher