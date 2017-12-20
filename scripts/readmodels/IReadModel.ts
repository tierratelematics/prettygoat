import {ISnapshotStrategy} from "../snapshots/ISnapshotStrategy";
import {WhenBlock} from "../projections/Matcher";
import { NotificationBlock } from "../projections/IProjection";

export interface IReadModelDefinition<T = any> {
    define(): IReadModel<T>;
}

export interface IReadModel<T = any> {
    name: string;
    definition: WhenBlock<T>;
    snapshot?: ISnapshotStrategy;
    notify?: NotificationBlock<T>;
}

export const READMODEL_DEFAULT_NOTIFY = "Main";
