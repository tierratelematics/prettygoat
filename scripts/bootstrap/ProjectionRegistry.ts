import {injectable, inject} from "inversify";
import {interfaces} from "inversify";
import IObjectContainer from "../ioc/IObjectContainer";
import * as _ from "lodash";
import ITickScheduler from "../ticks/ITickScheduler";
import Dictionary from "../util/Dictionary";
import {IProjection, IProjectionDefinition} from "../projections/IProjection";
import {IReadModelDefinition} from "../readmodels/IReadModel";

export type RegistryLookup<T = any> = [string, IProjection<T>];

export interface IProjectionRegistry {
    master<T>(constructor: interfaces.Newable<IProjectionDefinition<T>>);
    index<T>(constructor: interfaces.Newable<IProjectionDefinition<T>>);
    readmodel<T>(constructor: interfaces.Newable<IReadModelDefinition<T>>);
    add<T>(constructor: interfaces.Newable<IProjectionDefinition<T>>): IProjectionRegistry;
    forArea(area: string);
    projections(): RegistryLookup[];
    projectionFor<T>(name: string, area?: string): RegistryLookup<T>;
}

@injectable()
export class ProjectionRegistry implements IProjectionRegistry {

    private registry: RegistryLookup[] = [];
    private unregisteredProjections: interfaces.Newable<IProjectionDefinition>[] = [];

    constructor(@inject("IObjectContainer") private container: IObjectContainer,
                @inject("Factory<ITickScheduler>") private tickSchedulerFactory: interfaces.Factory<ITickScheduler>,
                @inject("ITickSchedulerHolder") private tickSchedulerHolder: Dictionary<ITickScheduler>) {

    }

    master<T>(constructor: interfaces.Newable<IProjectionDefinition<T>>) {
        return this.add(constructor).forArea("Master");
    }

    index<T>(constructor: interfaces.Newable<IProjectionDefinition<T>>) {
        return this.add(constructor).forArea("Index");
    }

    readmodel<T>(constructor: interfaces.Newable<IReadModelDefinition<T>>) {
        return undefined;
    }

    add<T>(constructor: interfaces.Newable<IProjectionDefinition<T>>): IProjectionRegistry {
        this.unregisteredProjections.push(constructor);
        return this;
    }

    forArea(area: string) {
        let entries = _.map<interfaces.Newable<IProjectionDefinition>, RegistryLookup>(this.unregisteredProjections, definition => {
            let tickScheduler = <ITickScheduler>this.tickSchedulerFactory(),
                projection = this.container.resolve(definition).define(tickScheduler);
            this.tickSchedulerHolder[projection.name] = tickScheduler;
            if (this.isNotificationFieldValid(projection))
                throw new Error(`Notification field is incomplete on ${projection.name}`);
            return [area, projection];
        });
        this.registry = _.concat<RegistryLookup>(this.registry, entries);
        this.unregisteredProjections = [];
        if (this.hasDuplicatedEntries()) throw new Error("Cannot startup due to some projections with the same name");
    }

    private isNotificationFieldValid(projection: IProjection<any>): boolean {
        let events = _(projection.definition).keys().filter(key => key !== "$init").valueOf();
        return false;
    }

    private hasDuplicatedEntries(): boolean {
        // let entries = _(this.getAreas())
        //     .map((areaRegistry: AreaRegistry) => areaRegistry.entries)
        //     .concat()
        //     .flatten()
        //     .groupBy((entry: RegistryEntry<any>) => entry.projection.name)
        //     .valueOf();
        // return some(entries, (entry: RegistryEntry<any>[]) => entry.length > 1);
        return false;
    }

    projections(): RegistryLookup<any>[] {
        return this.registry;
    }

    projectionFor<T>(id: string, area: string): RegistryLookup<T> {
        return null;
    }
}
