/// <reference path="../typings/index.d.ts" />

import {IKernelModule, INewable} from "inversify";

declare module prettygoat {

    export interface IProjection<T> {
        name:string;
        split?:ISplit;
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

    export interface IProjectionDefinition<T> {
        define():IProjection<T>;
    }

    export interface IProjectionRegistry {
        master<T>(constructor:INewable<IProjectionDefinition<T>>):AreaRegistry;
        index<T>(constructor:INewable<IProjectionDefinition<T>>):AreaRegistry;
        add<T>(constructor:INewable<IProjectionDefinition<T>>, parametersKey?:(parameters:any) => string):IProjectionRegistry;
        forArea(area:string):AreaRegistry;
        getAreas():AreaRegistry[];
        getArea(areaId: string): AreaRegistry;
        getEntry<T>(id:string, area?:string):{ area:string, data:RegistryEntry<T>};
    }

    export class AreaRegistry {
        constructor(area:string, entries:RegistryEntry<any>[]);
    }

    export class RegistryEntry<T> {
        projection:IProjection<T>;
        name:string;
        parametersKey:(parameters:any) => string;

        constructor(projection:IProjection<T>, name:string, parametersKey?:(parameters:any) => string);
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

    export interface IEndpointConfig {
        host:string;
        port?:number;
        protocol:string;
        path?:string;
    }

    export interface ICassandraConfig {
        hosts:string[];
        keyspace:string;
    }

    export interface IPollToPushConfig {
        interval:number
    }

    export interface ISocketConfig {
        path:string;
    }
}

export = prettygoat;