import { ISnapshotStrategy } from "./ISnapshotStrategy";

export abstract class StreamSource {
    private "stream source member for structural type" = "";
}

export class AllStreamSource extends StreamSource { }

export class NamedStreamSource extends StreamSource { name: string; }

export class MultipleStreamSource extends StreamSource { names: Array<string>; }

export interface IProjection<T> {
    name: string;
    splits: boolean;
    splitKeys: any;
    streamSource: StreamSource;
    definition: any;
    snapshotStrategy?(): ISnapshotStrategy;
}
