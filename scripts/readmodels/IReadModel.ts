import {ISnapshotStrategy} from "../snapshots/ISnapshotStrategy";
import {IWhen} from "../projections/Matcher";

export interface IReadModelDefinition<T> {
    define(): IReadModel<T>;
}

export interface IReadModel<T> {
    name: string;
    definition: IWhen<T>;
    snapshot?: ISnapshotStrategy;
}
