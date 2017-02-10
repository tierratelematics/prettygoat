import {ISnapshotStrategy} from "./ISnapshotStrategy";
import {Event} from "../streams/Event";
import * as moment from "moment";
import Dictionary from "../util/Dictionary";

class TimeSnapshotStrategy implements ISnapshotStrategy {

    private threshold = 1000 * 60 * 5; //5 minutes
    private snapshots:Dictionary<number> = {};

    needsSnapshot(event:Event):boolean {
        let snapshot = this.snapshots[event.type];
        if (!snapshot)
            snapshot = this.snapshots[event.type] = this.toUnixTimestamp(event.timestamp);
        let needsSnapshot = moment.unix(this.toUnixTimestamp(event.timestamp)).diff(moment.unix(snapshot)) > this.threshold;
        if (needsSnapshot) this.snapshots[event.type] = this.toUnixTimestamp(event.timestamp);
        return needsSnapshot;
    }

    private toUnixTimestamp(date:Date):number {
        return Math.round(+date / 1000);
    }

    saveThreshold(ms:number) {
        this.threshold = ms;
    }
}

export default TimeSnapshotStrategy;