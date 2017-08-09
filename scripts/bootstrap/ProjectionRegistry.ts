import {injectable, inject} from "inversify";
import {interfaces} from "inversify";
import * as _ from "lodash";
import Dictionary from "../common/Dictionary";
import {IProjection, IProjectionDefinition} from "../projections/IProjection";
import {IReadModelDefinition} from "../readmodels/IReadModel";
import {Matcher} from "../projections/Matcher";
import {IProjectionFactory} from "../projections/ProjectionFactory";

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

export class SpecialAreas {
    static Master = "Master";
    static Index = "Index";
    static Readmodel = "Readmodel";
}

@injectable()
export class ProjectionRegistry implements IProjectionRegistry {

    private registry: RegistryLookup[] = [];
    private nameLookup: Dictionary<RegistryLookup> = {};
    private areaLookup: Dictionary<RegistryLookup> = {};
    private unregisteredProjections: interfaces.Newable<IProjectionDefinition>[] = [];

    constructor(@inject("IProjectionFactory") private factory: IProjectionFactory) {

    }

    master<T>(constructor: interfaces.Newable<IProjectionDefinition<T>>) {
        this.add(constructor).forArea(SpecialAreas.Master);
    }

    index<T>(constructor: interfaces.Newable<IProjectionDefinition<T>>) {
        this.add(constructor).forArea(SpecialAreas.Index);
    }

    readmodel<T>(constructor: interfaces.Newable<IReadModelDefinition<T>>) {
        this.registry.push([SpecialAreas.Readmodel, this.factory.create(constructor)]);
        this.buildLookups();
    }

    add<T>(constructor: interfaces.Newable<IProjectionDefinition<T>>): IProjectionRegistry {
        this.unregisteredProjections.push(constructor);
        return this;
    }

    forArea(area: string) {
        _.forEach(this.unregisteredProjections, definition => {
            let projection = this.factory.create(definition);
            if (/[:,/\\;()#]/.test(projection.name))
                throw new Error(`Projection name not valid on ${projection.name}`);
            if (!this.isNotificationFieldValid(projection))
                throw new Error(`Notification field is incomplete on ${projection.name}`);
            if (this.hasDuplicatedName(projection))
                throw new Error(`Duplicated name on ${projection.name}`);
            if (this.hasDuplicatedPublishPoints(projection, area))
                throw new Error(`Duplicated publish points on ${projection.name}`);
            this.registry.push([area, projection]);
        });
        this.unregisteredProjections = [];
        this.buildLookups();
    }

    private buildLookups() {
        this.nameLookup = _.zipObject<Dictionary<RegistryLookup>>(_.map(this.registry, entry => entry[1].name.toLowerCase()), this.registry);
        this.areaLookup = _.reduce(this.registry, (result, entry) => {
            let areaKeys = _(entry[1].publish).keys().map(key => (entry[0] + ":" + key).toLowerCase()).valueOf();
            let mappings = _.zipObject<Dictionary<RegistryLookup>>(areaKeys, _.map(areaKeys, key => entry));
            return _.assign(result, mappings);
        }, {});
    }

    private isNotificationFieldValid(projection: IProjection): boolean {
        let publishPoints = _.keys(projection.publish);
        if (!publishPoints.length) return true;
        let events = _(projection.definition).keys().filter(key => key !== "$init").valueOf();
        return _.every(publishPoints, point => {
            let notify = projection.publish[point].notify;
            if (!notify) return true;
            let matcher = new Matcher(notify);
            return _.every(events, event => !!matcher.match(event));
        });
    }

    private hasDuplicatedName(projection: IProjection): boolean {
        return !!_.find(this.registry, entry => entry[1].name === projection.name);
    }

    private hasDuplicatedPublishPoints(projection: IProjection, area: string): boolean {
        let publishPoints: string[] = _(this.registry).filter(entry => entry[0] === area).map(entry => _.keys(entry[1].publish)).flatten<string>().valueOf();
        return !!_.intersection<string>(publishPoints, _.keys(projection.publish)).length;
    }

    projections(): RegistryLookup<any>[] {
        return this.registry;
    }

    projectionFor<T>(name: string, area?: string): RegistryLookup<T> {
        if (!area) return this.nameLookup[name.toLowerCase()];
        else return this.areaLookup[(area + ":" + name).toLowerCase()];
    }
}
