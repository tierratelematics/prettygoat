/// <reference path="../typings/index.d.ts" />

import {IObservable, IDisposable, Observable} from "rx";
import {IKernelModule, INewable} from "inversify";

declare module prettygoat {

    export interface IMatcher {
        match(name:string):Function;
    }

    export interface IProjection<T> {
        name:string;
        split?:ISplit;
        streamSource:StreamSource;
        definition:IWhen<T>;
        snapshotStrategy?:ISnapshotStrategy;
    }

    export interface ISplit {
        $default?:(e:Object) => string;
        [name:string]:(e:Object) => string;
    }

    export interface IWhen<T extends Object> {
        $init?:() => T;
        $any?:(s:T, e:Object) => T;
        [name:string]:(s:T, e:Object) => T;
    }

    export interface ISnapshotStrategy {
        processedEvent(lastDate:Date):void;
        needsSnapshot():boolean;
    }


    export abstract class StreamSource {

    }

    export class AllStreamSource extends StreamSource {
    }


    export class NamedStreamSource extends StreamSource {
        name:string;
    }

    export class MultipleStreamSource extends StreamSource {
        names:Array<string>;
    }

    export interface IProjectionRunner<T> extends IObservable<T>, IDisposable {
        state:T;
        run():void;
        stop():void;
    }

    export interface IProjectionRunnerFactory {
        create<T>(projection:IProjection<T>):IProjectionRunner<T>
    }

    export interface IProjectionDefinition<T> {
        define():IProjection<T>;
    }

    export class ProjectionRunner<T> implements IProjectionRunner<T> {
        public state:T;

        constructor(streamId:string, stream:IStreamFactory, repository:ISnapshotRepository, matcher:IMatcher);

        run():void;

        stop():void;

        dispose():void;

        subscribe(observer:Rx.IObserver<T>):Rx.IDisposable
        subscribe(onNext?:(value:T) => void, onError?:(exception:any) => void, onCompleted?:() => void):Rx.IDisposable
        subscribe(observerOrOnNext?:(Rx.IObserver<T>) | ((value:T) => void), onError?:(exception:any) => void, onCompleted?:() => void):Rx.IDisposable;
    }

    export interface IStreamFactory {
        from(lastEvent:string):Observable<any>;
    }

    export interface ISnapshotRepository {
        getSnapshot<T>(streamId:string):Snapshot<T>;
        saveSnapshot<T>(streamId:string, snapshot:Snapshot<T>):void;
    }

    export class Snapshot<T> {
        public static Empty:Snapshot<any>;

        constructor(memento:T, lastEvent:string);
    }

    export interface IEventEmitter {
        emitTo(clientId:string, event:string, parameters:any):void;
    }

    export interface IPushNotifier {
        register<T>(projectionRunner:IProjectionRunner<T>, pushContext:PushContext):void;
    }

    export class PushContext {
        area:string;
        projectionName:string;
        parameters:any;

        constructor(area:string, projectionName?:string, parameters?:any);
    }

    export interface IClientRegistry {
        add(clientId:string, context:PushContext):void;
        clientsFor(context:PushContext):ClientEntry[];
        remove(clientId:string, context:PushContext):void;
    }

    export class ClientEntry {
        id:string;
        parameters:any;

        constructor(id:string, parameters?:any);
    }

    export interface IProjectionRegistry {
        master<T>(constructor:INewable<IProjectionDefinition<T>>):AreaRegistry;
        index<T>(constructor:INewable<IProjectionDefinition<T>>):AreaRegistry;
        add<T>(constructor:INewable<IProjectionDefinition<T>>, parameters?:any):IProjectionRegistry;
        forArea(area:string):AreaRegistry;
        getAreas():AreaRegistry[];
    }


    export class AreaRegistry {
        constructor(area:string, entries:RegistryEntry<any>[]);
    }

    export class RegistryEntry<T> {
        projection:IProjection<T>;
        name:string;
        parameters:any;

        constructor(projection:IProjection<T>, name:string, parameters?:any);
    }

    export function Projection(name:string);

    export class Engine {

        register(module:IModule);

        run(overrides?:any);
    }

    export interface IModule {
        modules?:IKernelModule;
        register(registry:IProjectionRegistry, serviceLocator?:IServiceLocator, overrides?:any):void;
    }

    export  interface IServiceLocator {
        get<T>(key:string, name?:string):T;
    }

    export interface IProjectionEngine {
        run():void;
    }
}

export = prettygoat;