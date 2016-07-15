import Event from "../streams/Event";

export interface ISnapshotStrategy {
    needsSnapshot(event:Event): boolean;
}
