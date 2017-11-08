import {Snapshot} from "./ISnapshotRepository";
import {Event} from "../events/Event";
import {inject, injectable} from "inversify";
import Dictionary from "../common/Dictionary";
import {IIdempotenceFilter} from "../events/IdempotenceFilter";

export interface ISnapshotProducer {
    produce<T>(event: Event): Snapshot<T>;
}

@injectable()
export class SnapshotProducer implements ISnapshotProducer {

    constructor(@inject("IdempotenceFilterHolder") private filterHolder: Dictionary<IIdempotenceFilter>) {

    }

    produce<T>(event: Event): Snapshot<T> {
        return new Snapshot<any>({ projectionState: event.payload }, event.timestamp, this.filterHolder[event.type].serialize());
    }
}
