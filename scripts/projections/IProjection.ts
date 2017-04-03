import {ISnapshotStrategy} from "../snapshots/ISnapshotStrategy";
import {Event} from "../streams/Event";
import {SpecialState} from "./SpecialState";
import {IFilterStrategy} from "../filters/IFilterStrategy";

export interface IWhen<T extends Object> {
    $init?:() => T;
    $any?:(s:T, payload:Object, event?:Event) => T;
    [name:string]:(s:T, payload:Object, event?:Event) => T|SpecialState<T>;
}

export interface ISplit {
    $default?:(e:Object, event?:Event) => string;
    [name:string]:(e:Object, event?:Event) => string;
}

export interface IProjection<T> {
    name:string;
    split?:ISplit;
    definition:IWhen<T>;
    snapshotStrategy?:ISnapshotStrategy;
    filterStrategy?: IFilterStrategy<T>;
}
