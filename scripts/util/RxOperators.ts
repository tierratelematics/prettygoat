import {Observable} from "rx";

export function flatMapSeries<T, T1>(action: (data: T) => Observable<T1> | Promise<T1>) {
    return function (observable: Observable<T>) {
        return observable.flatMapWithMaxConcurrent(1, data => Observable.defer(() => action(data)));
    }
};