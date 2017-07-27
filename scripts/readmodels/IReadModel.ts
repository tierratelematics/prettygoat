import {ISnapshotStrategy} from "../snapshots/ISnapshotStrategy";
import {WhenBlock} from "../projections/Matcher";

export interface IReadModelDefinition<T = any> {
    define(): IReadModel<T>;
}

export interface IReadModel<T = any> {
    name: string;
    definition: WhenBlock<T>;
    snapshot?: ISnapshotStrategy;
}
