import {Observable} from "rx";

export function flatMapSeries<T, T1>(selector: (data: T) => Observable<T1> | Promise<T1>) {
    return function (observable: Observable<T>) {
        return observable.flatMapWithMaxConcurrent(1, data => Observable.defer(() => selector(data)));
    }
}

export function untypedFlatMapSeries(selector: (data: any) => Observable<any> | Promise<any>) {
    return flatMapSeries<any, any>(selector);
}