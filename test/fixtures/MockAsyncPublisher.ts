import IAsyncPublisher from "../../scripts/util/IAsyncPublisher";
import {Observable} from "rx";

export default class MockAsyncPublisher<T> implements IAsyncPublisher<T> {

    publish(item: T) {
    }

    items(): Observable<T> {
        return undefined;
    }

}