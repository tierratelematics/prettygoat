import {Observable} from "rx";
import {ObservableOrPromise} from "./TypesUtil";

export function flatMapSeries<T, T1>(selector: (data: T) => ObservableOrPromise<T1>) {
    return function (observable: Observable<T>) {
        return observable.flatMapWithMaxConcurrent(1, data => Observable.defer(() => selector(data)));
    };
}

export function untypedFlatMapSeries(selector: (data: any) => ObservableOrPromise<any>) {
    return flatMapSeries<any, any>(selector);
}