export class ProjectionEngine {
    register(projection: IProjection) { }
    run() { }
}

export interface IProjection {
    definition(source: IProjectionSource): void;
    snapshotStrategy?(): ISnapshotStrategy;
}

interface ISnapshotStrategy { }

export interface IProjectionSplit {
    when(definition: any): void;
}

export function Projection(uri: string) {
    return function (target: Function) { };
}

export interface IProjectionSource {
    fromAll(): IProjectionHandling;
}

export interface IProjectionHandling {
    when(definition: any): void;
    splitBy(splitByDefinition: any): IProjectionSplit;
}
