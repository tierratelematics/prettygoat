import {ValueOrPromise} from "../util/TypesUtil";
import Dictionary from "../util/Dictionary";
import {IFilterStrategy} from "../publish/IFilterStrategy";
import {IReadModel} from "../readmodels/IReadModel";
import ITickScheduler from "../ticks/ITickScheduler";

export interface IProjectionDefinition<T = any> {
    define(tickScheduler?: ITickScheduler): IProjection<T>;
}

export interface IProjection<T = any> extends IReadModel<T> {
    publish: Dictionary<PublishPoint<T>>;
}

export type PublishPoint<T> = {
    notify?: INotification<T>;
    deliver?: IFilterStrategy<T>;
    readmodels?: string[];
}

export interface INotification<T extends Object> {
    $partition?: (parameters: any) => ValueOrPromise<NotificationKey>;
    $default?: (s: T, payload: Object) => ValueOrPromise<NotificationKey>;
    [name: string]: (s: T, payload: Object) => ValueOrPromise<NotificationKey>;
}

export type NotificationKey = string | string[];
