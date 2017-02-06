import {interfaces} from "inversify";
import {Observable} from "rx";
import {Request, Response} from "express";

export interface IProjection<T> {
    name: string;
    split?: ISplit;
    definition: IWhen<T>;
    snapshotStrategy?: ISnapshotStrategy;
    filterStrategy?: IFilterStrategy<T>;
}

export interface ISplit {
    $default?: (e: Object, event?: Event) => string;
    [name: string]: (e: Object, event?: Event) => string;
}

export interface IWhen<T extends Object> {
    $init?: () => T;
    $any?: (s: T, payload: Object, event?: Event) => T;
    [name: string]: (s: T, payload: Object, event?: Event) => T|SpecialState<T>;
}

export interface Event {
    type: string;
    payload: any;
    timestamp: string;
    splitKey: string;
}

declare abstract class SpecialState<T> {
    state: T;
}

export class SpecialStates {
    static stopSignalling<T>(state: T): SpecialState<T>;

    static deleteSplit(): SpecialState<any>;
}

declare class StopSignallingState<T> extends SpecialState<T> {
    state: T;

    constructor(state: T);
}

declare class DeleteSplitState extends SpecialState<any> {
    state: any;

    constructor();
}

export interface IProjectionDefinition<T> {
    define(tickScheduler?: ITickScheduler): IProjection<T>;
}

export interface Dictionary<T> {
    [index: string]: T
}

export interface ISnapshotStrategy {
    needsSnapshot(event: Event): boolean;
}

export class TimeSnapshotStrategy implements ISnapshotStrategy {

    needsSnapshot(event: Event): boolean;

    saveThreshold(ms: number);
}

export class CountSnapshotStrategy implements ISnapshotStrategy {

    needsSnapshot(event: Event): boolean;

    saveThreshold(threshold: number): void;
}

export interface IProjectionRegistry {
    master<T>(constructor: interfaces.Newable<IProjectionDefinition<T>>): AreaRegistry;
    index<T>(constructor: interfaces.Newable<IProjectionDefinition<T>>): AreaRegistry;
    add<T>(constructor: interfaces.Newable<IProjectionDefinition<T>>, parametersKey?: (parameters: any) => string): IProjectionRegistry;
    forArea(area: string): AreaRegistry;
    getAreas(): AreaRegistry[];
    getArea(areaId: string): AreaRegistry;
    getEntry<T>(id: string, area?: string): {area: string, data: RegistryEntry<T>};
}

export class AreaRegistry {
    constructor(area: string, entries: RegistryEntry<any>[]);
}

export class RegistryEntry<T> {
    projection: IProjection<T>;
    exposedName: string;
    parametersKey: (parameters: any) => string;

    constructor(projection: IProjection<T>, exposedName: string, parametersKey?: (parameters: any) => string);
}

export function Projection(name: string);

export class Engine {
    protected container: interfaces.Container;

    register(module: IModule): boolean;

    boot(overrides?: any);

    run(overrides?: any);
}

export interface IModule {
    modules?: (container: interfaces.Container) => void;
    register(registry: IProjectionRegistry, serviceLocator?: IServiceLocator, overrides?: any): void;
}

export  interface IServiceLocator {
    get<T>(key: string, name?: string): T;
}

export interface IEndpointConfig {
    host: string;
    port?: number;
    protocol: string;
    path?: string;
    notifications?: {
        host: string;
        port?: number;
        protocol: string;
        path?: string;
    }
}

export interface IApiKeyConfig {
    [index: number]: string;
    length: number;
}

export interface ICassandraConfig {
    hosts: string[];
    keyspace: string;
    fetchSize?: number;
}

export interface IPollToPushConfig {
    interval: number
}

export interface ISocketConfig {
    path: string;
}

export interface IClusterConfig {
    nodes: string[];
    port: number;
    host: string;
    forks: number;
}

export interface IRedisConfig {
    host: string;
    port: number;
}

export interface IFilterStrategy<T> {
    filter(state: T, context: IFilterContext): {filteredState: T, type: FilterOutputType};
}

export interface IFilterContext {
    headers: {[key: string]: string};
    params: {[key: string]: string};
}

export enum FilterOutputType {
    CONTENT,
    UNAUTHORIZED,
    FORBIDDEN
}

export enum LogLevel {
    Debug,
    Info,
    Warning,
    Error
}

export interface ILogger {
    debug(message: string);

    info(message: string);

    warning(message: string);

    error(error: string|Error);

    setLogLevel(level: LogLevel);
}

export class ConsoleLogger implements ILogger {

    debug(message: string);

    info(message: string);

    warning(message: string);

    error(error: string|Error);

    setLogLevel(level: LogLevel);
}

export interface IStreamFactory {
    from(lastEvent:Date, completions?:Observable<string>, definition?:IWhen<any>):Observable<Event>;
}

export interface ITickScheduler extends IStreamFactory {
    schedule(dueTime: number | Date, state?: string, splitKey?: string);
}

export class Tick {
    state: string;
    clock: Date | number;

    constructor(clock: Date, state?: string);
}

export function FeatureToggle(predicate: CheckPredicate);

export interface CheckPredicate {
    (): boolean
}

export interface IFeatureChecker {
    check(feature: any): boolean;
    canCheck(feature: any): boolean;
}

export class FeatureChecker implements IFeatureChecker {
    check(feature: any): boolean;

    canCheck(feature: any): boolean;
}

interface PredicatesStatic {
    always(): boolean;
    never(): boolean;
    environment(environments: string[]): () => boolean;
    version(version: string): () => boolean;
    compose(p1: CheckPredicate, p2: CheckPredicate): () => boolean;
    negate(predicate: CheckPredicate): () => boolean;
}

export var FeaturePredicates: PredicatesStatic;

export class ClusteredEngine extends Engine {
    run(overrides?: any);
}

export interface IReplicationManager {
    canReplicate(): boolean;
    replicate();
    isMaster(): boolean;
}