import Dictionary from "../common/Dictionary";
import {IDeliverStrategy} from "./Deliver";
import {IReadModel} from "../readmodels/IReadModel";

export interface IProjectionDefinition<T = any> {
    define(): IProjection<T>;
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
    $change: (s: T, context?: string[]) => NotificationKey;
}

export type NotificationKey = string | string[];
