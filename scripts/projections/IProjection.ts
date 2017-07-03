import Dictionary from "../util/Dictionary";
import {IDeliverStrategy} from "./Deliver";
import {IReadModel} from "../readmodels/IReadModel";
import ITickScheduler from "../ticks/ITickScheduler";

export interface IProjectionDefinition<T = any> {
    define(tickScheduler?: ITickScheduler): IProjection<T>;
}

export interface IProjection<T = any> extends IReadModel<T> {
    publish: Dictionary<PublishPoint<T>>;
}

export type PublishPoint<T> = {
    notify?: NotificationBlock<T>;
    deliver?: IDeliverStrategy<T>;
    readmodels?: ReadModelBlock<T>;
}

export interface NotificationBlock<T extends Object> {
    $key?: (parameters: any) => NotificationKey;
    $default?: (s: T, payload: Object) => NotificationKey;
    [name: string]: (s: T, payload: Object) => NotificationKey;
}

export interface ReadModelBlock<T extends Object> {
    $list: NotificationKey;
    $change: (s: T) => NotificationKey;
}

export type NotificationKey = string | string[];
