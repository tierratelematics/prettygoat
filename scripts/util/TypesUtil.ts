export type ValueOrPromise<T> = T | Promise<T>;

export function isPromise(value: any): boolean {
    return Promise.resolve(value) === value;
}