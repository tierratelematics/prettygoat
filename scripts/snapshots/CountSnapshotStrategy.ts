import {ISnapshotStrategy} from "./ISnapshotStrategy";
import {Event} from "../events/Event";
import Dictionary from "../common/Dictionary";

class CountSnapshotStrategy implements ISnapshotStrategy {

    private threshold = 100;
    private counters: Dictionary<number> = {};

    needsSnapshot(event: Event): boolean {
        let counter = this.counters[event.type] || 0;
        counter++;
        this.counters[event.type] = counter;
        let needsSnapshot = this.threshold === counter;
        if (needsSnapshot) this.counters[event.type] = 0;
        return needsSnapshot;
    }

    saveThreshold(threshold: number): void {
        this.threshold = threshold;
    }
}

export default CountSnapshotStrategy
