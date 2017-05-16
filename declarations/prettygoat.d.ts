import {interfaces} from "inversify";
import {Observable, IDisposable} from "rx";
import {IncomingMessage} from "http";
import {ServerResponse} from "http";
import {Application} from "express";
import {Server} from "net";

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

export interface IObjectContainer extends IServiceLocator {
    set<T>(key: string, object: interfaces.Newable<T>|T, parent?: string);
    contains(key: string): boolean;
    remove(key: string): void;
}

export class PrettyGoatModule implements IModule {

    modules?: (container: interfaces.Container) => void;

    register(registry: IProjectionRegistry, serviceLocator?: IServiceLocator, overrides?: any): void;
}

export interface IProjectionEngine {
    run(projection?: IProjection<any>, context?: PushContext);
}

export class ProjectionEngine implements IProjectionEngine {
    run(projection?: IProjection<any>, context?: PushContext);
}

export class PushContext {
    area: string;
    projectionName: string;
    parameters: any;

    constructor(area: string, projectionName: string, parameters?: any);
}

export interface IProjection<T> {
    name: string;
    split?: ISplit;
    definition: IWhen<T>;
    snapshotStrategy?: ISnapshotStrategy;
    filterStrategy?: IFilterStrategy<T>;
}

export type SplitKey = string | string[];

export interface ISplit {
    $default?: (e: Object, event?: Event) => ValueOrPromise<SplitKey>;
    [name: string]: (e: Object, event?: Event) => ValueOrPromise<SplitKey>;
}

export interface IWhen<T extends Object> {
    $init?: () => T;
    $any?: (s: T, payload: Object, event?: Event) => ValueOrPromise<T>;
    [name: string]: (s: T, payload: Object, event?: Event) => ValueOrPromise<T | SpecialState<T>>;
}

export interface Event {
    type: string;
    payload: any;
    timestamp: Date;
    splitKey: string;
}

export interface IProjectionRunner<T> extends IDisposable {
    state: T|Dictionary<T>;
    stats: ProjectionStats;
    run(snapshot?: Snapshot<T|Dictionary<T>>): void;
    stop(): void;
    notifications(): Observable<Event>;
}

export interface IProjectionRunnerFactory {
    create<T>(projection: IProjection<T>): IProjectionRunner<T>;
}

export interface IMatcher {
    match(name: string): Function;
}

export class Matcher implements IMatcher {

    constructor(definition: any);

    match(name: string): Function;
}

export var Identity: <T>(value: T) => T;

export class ProjectionRunner<T> implements IProjectionRunner<T> {
    state: T|Dictionary<T>;
    stats: ProjectionStats;

    constructor(projection: IProjection<T>, stream: IStreamFactory, matcher: IMatcher, readModelFactory: IReadModelFactory,
                tickScheduler: IStreamFactory, dateRetriever: IDateRetriever);

    notifications();

    run(snapshot?: Snapshot<T|Dictionary<T>>): void;

    protected subscribeToStateChanges();

    stop(): void;

    dispose(): void;
}

export class SplitProjectionRunner<T> extends ProjectionRunner<T> {
    state: Dictionary<T>;

    constructor(projection: IProjection<T>, stream: IStreamFactory, matcher: IMatcher,
                splitMatcher: IMatcher, readModelFactory: IReadModelFactory, tickScheduler: IStreamFactory,
                dateRetriever: IDateRetriever);

    run(snapshot?: Snapshot<T|Dictionary<T>>): void;
}

export class ProjectionStats {
    running: boolean;
    events: number;
    readModels: number;
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
    area: string;
    entries: RegistryEntry<any>[];

    constructor(area: string, entries: RegistryEntry<any>[]);
}

export class RegistryEntry<T> {
    projection: IProjection<T>;
    exposedName: string;
    parametersKey: (parameters: any) => string;
    construct: interfaces.Newable<IProjectionDefinition<T>>;

    constructor(projection: IProjection<T>, exposedName: string, parametersKey?: (parameters: any) => string, construct?: interfaces.Newable<IProjectionDefinition<T>>);
}

export function Projection(name: string);

export interface IEventDeserializer {
    toEvent(row): Event;
}

export interface ISnapshotRepository {
    initialize(): Observable<void>;
    getSnapshots(): Observable<Dictionary<Snapshot<any>>>;
    getSnapshot<T>(streamId: string): Observable<Snapshot<T>>;
    saveSnapshot<T>(streamId: string, snapshot: Snapshot<T>): Observable<void>;
    deleteSnapshot(streamId: string): Observable<void>;
}

export class Snapshot<T> {
    static Empty: Snapshot<any>;

    memento: T;
    lastEvent: Date;

    constructor(memento: T, lastEvent: Date);
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

export interface IEndpointConfig {
    port: number;
}

export interface INotificationConfig {
    protocol: string;
    host: string;
    port?: number;
    path?: string;
}

export interface IApiKeyConfig {
    [index: number]: string;
    length: number;
}

export interface ISocketConfig {
    path: string;
}

export interface Dictionary<T> {
    [index: string]: T
}

export type FilterResult<T> = {filteredState: T, type: FilterOutputType};

export interface IFilterStrategy<TState> {
    filter<TResult>(state: TState, context: IFilterContext): ValueOrPromise<FilterResult<TResult>>;
}

export interface IFilterContext {
    headers: Dictionary<string>;
    params: Dictionary<string>;
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

export var NullLogger: ILogger;

export interface IStreamFactory {
    from(lastEvent: Date, completions?: Observable<string>, definition?: IWhen<any>): Observable<Event>;
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

export interface IReplicationManager {
    canReplicate(): boolean;
    replicate();
    isMaster(): boolean;
}

export interface IRequestAdapter {
    route(request: IRequest, response: IResponse);
    canHandle(request: IRequest, response: IResponse): boolean;
}

export class RequestAdapter implements IRequestAdapter {
    protected routeResolver: IRouteResolver;

    constructor(routeResolver: IRouteResolver);

    route(request: IRequest, response: IResponse);

    canHandle(request: IRequest, response: IResponse);

}

export interface IRequestHandler {
    handle(request: IRequest, response: IResponse);
    keyFor(request: IRequest): string;
}

export interface IRouteResolver {
    resolve(request: IRequest): IRouteContext;
}

export type IRouteContext = [IRequestHandler, any];

export interface IRequest {
    url: string;
    channel: string;
    method: string;
    headers: Dictionary<string>;
    query: Dictionary<string>;
    params: any;
    body: any;
    originalRequest: IncomingMessage;
}

export interface IResponse {
    header(key: string, value: string);
    setHeader(key: string, value: string);
    status(code: number);
    send(data?: any);
    end();
    originalResponse: ServerResponse;
}

export interface IMiddleware {
    transform(request: IRequest, response: IResponse, next: Function);
}

export interface IRequestParser {
    parse(request: IncomingMessage, response: ServerResponse): RequestData;
}

export interface IMiddlewareTransformer {
    transform(request: IRequest, response: IResponse): Promise<RequestData>;
}

export function Route(method: Methods, path: string);

export type Methods = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "PATCH";

export type RequestData = [IRequest, IResponse];

export class RouteResolver implements IRouteResolver {
    constructor(requestHandlers: IRequestHandler[]);

    resolve(request: IRequest): IRouteContext;
}

export interface IServerProvider {
    provideServer(): Server;
    provideApplication(): Application;
}

export interface ISocketFactory {
    socketForPath(path?: string): SocketIO.Server;
}

export interface IReadModelFactory extends IStreamFactory {
    asList(): any[];
    publish(event: Event): void;
}

export interface IProjectionSorter {
    sort(): string[];
    dependencies(projection: IProjection<any>): string[];
    dependents(projection: IProjection<any>): string[];
}

export class PortDiscovery {
    static freePort(initialPort: number, host?: string): Promise<number>;
}

export interface IDateRetriever {
    getDate(): Date;
}

export type ValueOrPromise<T> = T | Promise<T>;

export interface ILookup {
    keysFor(id: string): Promise<string[]>;
}

export interface ILookupFactory {
    lookupFor<T extends IProjectionDefinition<LookupModel>>(projectionName: string): ILookup;
}

export interface LookupModel extends Dictionary<string[]> {

}