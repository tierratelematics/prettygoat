import {ISnapshotStrategy} from "../snapshots/ISnapshotStrategy";
import {IProjection, IWhen} from "../projections/IProjection";

export interface IReadModelDefinition<T> {
    define(): IProjection<T>;
}

export interface IReadModel<T> {
    definition: IWhen<T>;
    snapshot?: ISnapshotStrategy;
}
