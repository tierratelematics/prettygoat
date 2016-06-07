import { ISnapshotStrategy } from "../streams/ISnapshotStrategy";

export abstract class StreamSource {
    private "stream source member for structural type" = "";
}

export class AllStreamSource extends StreamSource { }

export class NamedStreamSource extends StreamSource { name: string; }

export class MultipleStreamSource extends StreamSource { names: Array<string>; }

export interface IWhen<T extends Object> {
    $init?: () => T;
    $any?: (s: T, e: Object) => T;
    [name: string]: (s: T, e: Object) => T;
}

export interface ISplit {
    $default?: (e: Object) => string;
    [name: string]: (e: Object) => string;
}

export interface IProjection<T> {
    name: string;
    split?: ISplit;
    streamSource: StreamSource;
    definition: IWhen<T>;
    snapshotStrategy?: ISnapshotStrategy,
    parametersKey?: (parameters:any) => string
}
