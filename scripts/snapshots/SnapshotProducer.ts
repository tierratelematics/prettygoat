import {Snapshot} from "./ISnapshotRepository";
import {Event} from "../events/Event";
import {inject, injectable} from "inversify";
import Dictionary from "../common/Dictionary";
import {IIdempotenceFilter} from "../events/IdempotenceFilter";
import { IMementoProducer } from "./MementoProducer";

export interface ISnapshotProducer {
    produce<T>(event: Event): Snapshot<T>;
}

@injectable()
export class SnapshotProducer implements ISnapshotProducer {

    constructor(@inject("IdempotenceFilterHolder") private filterHolder: Dictionary<IIdempotenceFilter>,
                @inject("IMementoProducer") private mementoProducer: IMementoProducer<any>) {

    }

    produce<T>(event: Event): Snapshot<T> {
        return new Snapshot<any>(this.mementoProducer.produce(event), event.timestamp, this.filterHolder[event.type].serialize());
    }
}
