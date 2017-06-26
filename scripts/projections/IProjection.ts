import {ISnapshotStrategy} from "../snapshots/ISnapshotStrategy";
import {IFilterStrategy} from "../filters/IFilterStrategy";
import {ValueOrPromise} from "../util/TypesUtil";
import {Event} from "../events/Event";
import Dictionary from "../util/Dictionary";

export interface IProjection<T> {
    definition: IWhen<T>;
    snapshot?: ISnapshotStrategy;
    publish: Dictionary<PublishPoint<T>>;
}

export interface INotification<T extends Object> {
    $default?: (s: T, payload: Object) => ValueOrPromise<string[]>;
    [name: string]: (s: T, payload: Object) => ValueOrPromise<string[]>;
}

export interface IWhen<T extends Object> {
    $init?: () => T;
    [name: string]: (s: T, payload: Object, event?: Event) => ValueOrPromise<T>;
}

export type PublishPoint<T> = {
    notify: INotification<T>;
    deliver: IFilterStrategy<T>;
    readModels: string[];
}
