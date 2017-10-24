import {isArray} from "lodash";
import {Observable} from "rxjs";

export type ValueOrPromise<T> = T | Promise<T>;

export function isPromise(value: any): boolean {
    return Promise.resolve(value) === value;
}

export function toArray<T>(value: any): T[] {
    return isArray(value) ? value : [value];
}

export function retrySequence(callback: (error: Error) => void = () => null,
                              backoffRetries = 5, backoffInterval = 1000, pollingInterval = 10000) {
    return function (source: Observable<any>) {
        return source.retryWhen(errors => {
            return Observable
                .zip(Observable.range(1, backoffRetries), errors, (i, e) => [i, e])
                .do(data => callback(data[1]))
                .flatMap(data => Observable.timer(data[0] * data[0] * backoffInterval))
                .concat(Observable
                    .timer(pollingInterval, pollingInterval)
                    .zip(errors, (timer, error) => error)
                    .do(error => callback(error)));
        });
    };
}
