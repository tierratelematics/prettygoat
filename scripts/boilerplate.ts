export class ProjectionEngine {
    register(projection: IProjection) { }
    run() { }
}

export interface IProjection {
    definition(source: IProjectionSource): IProjectionDefinition;
    snapshotStrategy?(): ISnapshotStrategy;
}

interface ISnapshotStrategy { }

export interface IProjectionFrom { }

export interface IProjectionDefinition {
    $init?: () => any;
    $any?: (state: any, event: any) => any;
}

export function Projection(uri: string) {
    return function (target: Function) { };
}

export interface IProjectionSource {
    fromAll(): IProjectionGroup;
}

export interface IProjectionGroup {
    when: IProjectionDefinition;
    groupBy(groupByDefinition: any): IProjectionFrom;
}
