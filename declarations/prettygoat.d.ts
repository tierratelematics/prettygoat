///<reference types="socket.io" />
import {interfaces} from "inversify";
import {Observable} from "rxjs";
import {ISubscription} from "rxjs/Subscription";
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

export let lazyInject: (serviceIdentifier: string | symbol | interfaces.Newable<any> | interfaces.Abstract<any>) => (proto: any, key: string) => void;

export interface IModule {
    modules?: (container: interfaces.Container) => void;
    register(registry: IProjectionRegistry, serviceLocator?: IServiceLocator, overrides?: any): void;
}

export  interface IServiceLocator {
    get<T>(key: string, name?: string): T;
}

export interface IObjectContainer extends IServiceLocator {
    set<T>(key: string, object: interfaces.Newable<T> | T, parent?: string);
    resolve<T>(constructor: interfaces.Newable<T>);
    contains(key: string): boolean;
    remove(key: string): void;
}

export class PrettyGoatModule implements IModule {

    modules?: (container: interfaces.Container) => void;

    register(registry: IProjectionRegistry, serviceLocator?: IServiceLocator, overrides?: any): void;
}

export interface IProjectionEngine {
    run(projection?: IProjection<any>);
}

export class ProjectionEngine implements IProjectionEngine {
    run(projection?: IProjection<any>);
}

export class PushContext {
    area: string;
    projectionName: string;
    parameters: any;

    constructor(area: string, projectionName: string, parameters?: any);
}

export interface IProjection<T = any> extends IReadModel<T> {
    publish: Dictionary<PublishPoint<T>>;
}

export type PublishPoint<T> = {
    notify?: NotificationBlock<T>;
    deliver?: IDeliverStrategy<T>;
    readmodels?: ReadModelBlock<T>;
}

export interface NotificationBlock<T extends Object> {
    $key?: (parameters: any) => NotificationKey;
    $default?: (s: T, payload: Object) => NotificationKey;
    [name: string]: (s: T, payload: Object) => NotificationKey;
}

export interface ReadModelBlock<T extends Object> {
    $list: NotificationKey;
    $change: (s: T) => NotificationKey;
}

export type NotificationKey = string | string[];

export interface IReadModel<T = any> {
    name: string;
    definition: WhenBlock<T>;
    snapshot?: ISnapshotStrategy;
}

export interface WhenBlock<T extends Object> {
    $init?: () => T;
    [name: string]: (s: T, payload: Object, event?: Event) => ValueOrPromise<T>;
}

export enum DeliverAuthorization {
    CONTENT,
    UNAUTHORIZED,
    FORBIDDEN
}

export type DeliverResult<T> = [T, DeliverAuthorization];

export interface DeliverContext {
    headers: Dictionary<string>;
    params: Dictionary<string>;
}

export interface IDeliverStrategy<TState, TResult = any> {
    deliver(state: TState, context: DeliverContext, readModels?: Dictionary<any>): ValueOrPromise<DeliverResult<TResult>>;
}

export interface IProjectionDefinition<T = any> {
    define(): IProjection<T>;
}

export interface IReadModelDefinition<T = any> {
    define(): IReadModel<T>;
}

export interface Event<T = any> {
    type: string;
    payload: T;
    timestamp: Date;
}

export interface IProjectionStreamGenerator {
    generate(projection: IProjection<any>, snapshot: Snapshot<any>, completions: Observable<any>): Observable<Event>;
}

export interface IProjectionRunner<T = any> extends ISubscription {
    state: T;
    stats: ProjectionStats;
    run(snapshot?: Snapshot<T>): void;
    stop(): void;
    notifications(): Observable<[Event<T>, Dictionary<string[]>]>;
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

export class ProjectionRunner<T> implements IProjectionRunner<T> {
    state: T;
    stats: ProjectionStats;
    closed: boolean;

    constructor(projection: IProjection<T>, streamGenerator: IProjectionStreamGenerator,
                matcher: IMatcher, notifyMatchers: Dictionary<IMatcher>);

    notifications();

    run(snapshot?: Snapshot<T | Dictionary<T>>): void;

    stop(): void;

    unsubscribe(): void;
}

export class ProjectionStats {
    running: boolean;
    events: number;
    lastEvent: Date;
    realtime: boolean;
    failed: boolean;
}

export type RegistryLookup<T = any> = [string, IProjection<T>];

export interface IProjectionFactoryExtender {
    extend(definition: any);
}

export interface IProjectionRegistry {
    master<T>(constructor: interfaces.Newable<IProjectionDefinition<T>>);
    index<T>(constructor: interfaces.Newable<IProjectionDefinition<T>>);
    readmodel<T>(constructor: interfaces.Newable<IReadModelDefinition<T>>);
    add<T>(constructor: interfaces.Newable<IProjectionDefinition<T>>): IProjectionRegistry;
    forArea(area: string);
    projections(): RegistryLookup[];
    projectionFor<T>(name: string, area?: string): RegistryLookup<T>;
}

export interface IEventDeserializer {
    toEvent(row): Event;
}

export interface ISnapshotRepository {
    getSnapshot<T>(name: string): Promise<Snapshot<T>>;
    saveSnapshot<T>(name: string, snapshot: Snapshot<T>): Promise<void>;
    deleteSnapshot(name: string): Promise<void>;
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
}

export type IApiKeyConfig = string[];

export interface ISocketConfig {
    path: string;
}

type RedisEndpoint = {
    host: string;
    port: number;
}

export type IRedisConfig = RedisEndpoint | RedisEndpoint[]

export interface Dictionary<T> {
    [index: string]: T;
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

    error(error: string | Error);

    setLogLevel(level: LogLevel);
}

export class ConsoleLogger implements ILogger {

    debug(message: string);

    info(message: string);

    warning(message: string);

    error(error: string | Error);

    setLogLevel(level: LogLevel);
}

export var NullLogger: ILogger;

export interface IStreamFactory {
    from(lastEvent: Date, completions?: Observable<string>, definition?: WhenBlock<any>): Observable<Event>;
}

export function FeatureToggle(predicate: CheckPredicate);

export interface CheckPredicate {
    (): boolean;
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
    handle(request: IRequest, response: IResponse): ValueOrPromise<void>;
    keyFor(request: IRequest): string;
}

export interface IRouteResolver {
    resolve(request: IRequest): IRouteContext;
}

export type IRouteContext = [IRequestHandler, any];

export interface IRequest<T = any> {
    url: string;
    method: string;
    headers: Dictionary<string>;
    query: Dictionary<string>;
    params: any;
    body: T;
    originalRequest: IncomingMessage;
}

export interface IResponse {
    originalResponse: ServerResponse;
    header(key: string, value: string);
    setHeader(key: string, value: string);
    status(code: number);
    send(data?: any);
    end();
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

export function Route(path: string, method?: Methods);

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

export class PortDiscovery {
    static freePort(initialPort: number, host?: string): Promise<number>;
}

export interface IDateRetriever {
    getDate(): Date;
}

export type ValueOrPromise<T> = T | Promise<T>;

export interface IReadModelNotifier {
    changes(name: string): Observable<Event>;
    notifyChanged(name: string, timestamp: Date);
}

export interface IReadModelRetriever {
    modelFor<T>(name: string): Promise<T>;
}

export class SpecialEvents {
    static REALTIME: string;
    static FETCH_EVENTS: string;
    static READMODEL_CHANGED: string;
}

export interface IAsyncPublisher<T> {
    publish(item: T);
    items(grouping?: (item: T) => string): Observable<T>;
}

export interface IAsyncPublisherFactory {
    publisherFor<T>(runner: IProjectionRunner): IAsyncPublisher<T>;
}