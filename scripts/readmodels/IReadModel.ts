import {ISnapshotStrategy} from "../snapshots/ISnapshotStrategy";
import {IWhen} from "../projections/Matcher";

export interface IReadModelDefinition<T = any> {
    define(): IReadModel<T>;
}

export interface IReadModel<T = any> {
    name: string;
    definition: IWhen<T>;
    snapshot?: ISnapshotStrategy;
}
