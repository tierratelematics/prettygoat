export interface IIdempotenceFilter {
    filter(event: Event): boolean;
}

export class IdempotenceFilter implements IIdempotenceFilter {
    filter(event: Event): boolean {
        throw new Error("Method not implemented.");
    }

}

export type RingBufferItem = {
    id: string;
    timestamp: Date;
}
