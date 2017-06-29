import {Event} from "../events/Event";

export interface ISnapshotStrategy {
    needsSnapshot(event: Event): boolean;
}
