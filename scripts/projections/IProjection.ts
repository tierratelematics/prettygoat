import {ISnapshotStrategy} from "../snapshots/ISnapshotStrategy";
import {Event} from "../streams/Event";
import {SpecialState} from "./SpecialState";
import {IFilterStrategy} from "../filters/IFilterStrategy";
import {ValueOrPromise} from "../util/TypesUtil";

export interface IWhen<T extends Object> {
    $init?: () => T;
    $any?: (s: T, payload: Object, event?: Event) => ValueOrPromise<T>;
    [name: string]: (s: T, payload: Object, event?: Event) => ValueOrPromise<T | SpecialState<T>>;
}

export type SplitKey = string | string[];

export interface ISplit {
    $default?: (e: Object, event?: Event) => ValueOrPromise<SplitKey>;
    [name: string]: (e: Object, event?: Event) => ValueOrPromise<SplitKey>;
}

export interface IProjection<T> {
    name: string;
    split?: ISplit;
    definition: IWhen<T>;
    snapshotStrategy?: ISnapshotStrategy;
    filterStrategy?: IFilterStrategy<T>;
}
