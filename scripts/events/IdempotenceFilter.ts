import {Event} from "./Event";
import Dictionary from "../common/Dictionary";
const cbuffer = require("CBuffer");
import {forEach, omit, zipObject, map, includes} from "lodash";
import SpecialEvents from "./SpecialEvents";

export interface IIdempotenceFilter {
    setItems(items: RingBufferItem[]);

    filter(event: Event): boolean;

    serialize(): RingBufferItem[];
}

export class IdempotenceFilter implements IIdempotenceFilter {
    private ringBuffer: any;
    private dictionaryReplica: Dictionary<Event>;

    constructor(items: RingBufferItem[] = [], bufferSize = 100) {
        this.dictionaryReplica = zipObject(map(items, item => item.id), items);
        this.ringBuffer = new cbuffer(bufferSize);
        this.setItems(items);
    }

    setItems(items: RingBufferItem[]) {
        forEach(items, item => this.ringBuffer.push(item));
    }

    filter(event: Event): boolean {
        if (includes([SpecialEvents.FETCH_EVENTS, SpecialEvents.REALTIME], event.type)) return true;

        let filtered = !this.dictionaryReplica[event.id];
        if (filtered) {
            this.dictionaryReplica[event.id] = event;
            this.ringBuffer.push(omit(event, ["payload", "type", "metadata"]));
        }
        return filtered;
    }

    serialize(): RingBufferItem[] {
        return this.ringBuffer.toArray().sort((first, second) => first.timestamp - second.timestamp);
    }
}

export type RingBufferItem = {
    id: string;
    timestamp: Date;
}
