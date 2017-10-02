import {Event} from "./Event";

const cbuffer = require("CBuffer");
import {forEach} from "lodash";

export interface IIdempotenceFilter {
    filter(event: Event): boolean;
}

export class IdempotenceFilter implements IIdempotenceFilter {

    private ringBuffer = new cbuffer(100);

    constructor(buffer: RingBufferItem[] = []) {
        forEach(buffer, item => this.ringBuffer.push(item));
    }

    filter(event: Event): boolean {
        let filtered = this.ringBuffer.every(item => item.id !== event.id, this);
        if (filtered) this.ringBuffer.push(event);
        return filtered;
    }

    serialize(): RingBufferItem[] {
        return this.ringBuffer.toArray();
    }
}

export type RingBufferItem = {
    id: string;
    timestamp: Date;
}
