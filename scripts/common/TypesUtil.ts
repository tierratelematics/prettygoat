import {isArray} from "lodash";
import {Observable} from "rxjs";

export type ValueOrPromise<T> = T | Promise<T>;

export function isPromise(value: any): boolean {
    return Promise.resolve(value) === value;
}

export type ObservableOrPromise<T> = Observable<T> | Promise<T>;

export function toArray<T>(value: any): T[] {
    return isArray(value) ? value : [value];
}