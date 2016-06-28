import { ISnapshotStrategy } from "../snapshots/ISnapshotStrategy";

export interface IWhen<T extends Object> {
    $init?: () => T;
    $any?: (s: T, e: Object) => T;
    [name: string]: (s: T, e: Object) => T;
}

export interface ISplit {
    $default?: (e: Object) => string;
    [name: string]: (e: Object) => string;
}

export interface IProjection<T> {
    name: string;
    split?: ISplit;
    definition: IWhen<T>;
    snapshotStrategy?: ISnapshotStrategy;
}
