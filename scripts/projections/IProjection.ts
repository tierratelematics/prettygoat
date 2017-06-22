import {ISnapshotStrategy} from "../snapshots/ISnapshotStrategy";
import {Event} from "../streams/Event";
import {IFilterStrategy} from "../filters/IFilterStrategy";
import {ValueOrPromise} from "../util/TypesUtil";

export interface IWhen<T extends Object> {
    $init?: () => T;
    [name: string]: (s: T, payload: Object, event?: Event) => ValueOrPromise<T>;
}

export interface IProjection<T> {
    name: string;
    definition: IWhen<T>;
    snapshotStrategy?: ISnapshotStrategy;
    filterStrategy?: IFilterStrategy<T>;
    notification?: INotification<T>;
}

export interface INotification<T extends Object> {
    $default?: (s: T, payload: Object) => ValueOrPromise<string[]>;
    [name: string]: (s: T, payload: Object) => ValueOrPromise<string[]>;
}
