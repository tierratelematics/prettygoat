import {IdempotenceFilter, IIdempotenceFilter, RingBufferItem} from "./IdempotenceFilter";

export interface IIdempotenceFilterFactory {
    for(projection: string, buffer?: RingBufferItem[]): IIdempotenceFilter;
}

export class IdempotenceFilterFactory implements IIdempotenceFilterFactory {
    for(projection: string, buffer?: RingBufferItem[]): IIdempotenceFilter {
        return new IdempotenceFilter(buffer);
    }
}
