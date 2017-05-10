import {isArray} from "lodash";

export type ValueOrPromise<T> = T | Promise<T>;

export function isPromise(value: any): boolean {
    return Promise.resolve(value) === value;
}

export function toArray<T>(value: any): T[] {
    return isArray(value) ? value : [value];
}