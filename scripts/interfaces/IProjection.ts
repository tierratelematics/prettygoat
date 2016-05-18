import { ISnapshotStrategy } from "./ISnapshotStrategy";

export interface IProjection<T> {
    definition: any;
    snapshotStrategy?(): ISnapshotStrategy;
}
