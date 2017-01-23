import IProjectionRegistry from "./IProjectionRegistry";
import AreaRegistry from "./AreaRegistry";
import RegistryEntry from "./RegistryEntry";
import IProjectionDefinition from "./IProjectionDefinition";
import Constants from "./Constants";
import {injectable, inject} from "inversify";
import {ProjectionAnalyzer} from "../projections/ProjectionAnalyzer";
import {interfaces} from "inversify";
import IObjectContainer from "../ioc/IObjectContainer";
import * as _ from "lodash";
import ITickScheduler from "../ticks/ITickScheduler";
import Dictionary from "../util/Dictionary";
import {IProjection} from "../projections/IProjection";

@injectable()
class ProjectionRegistry implements IProjectionRegistry {

    private registry:AreaRegistry[] = [];
    private unregisteredEntries:{
        ctor:interfaces.Newable<IProjectionDefinition<any>>,
        name:string,
        parametersKey?:(parameters:any) => string
    }[] = [];

    constructor(@inject("ProjectionAnalyzer") private analyzer:ProjectionAnalyzer,
                @inject("IObjectContainer") private container:IObjectContainer,
                @inject("Factory<ITickScheduler>") private tickSchedulerFactory:interfaces.Factory<ITickScheduler>,
                @inject("ITickSchedulerHolder") private tickSchedulerHolder:Dictionary<ITickScheduler>) {

    }

    master<T>(constructor:interfaces.Newable<IProjectionDefinition<T>>):AreaRegistry {
        return this.add(constructor).forArea(Constants.MASTER_AREA);
    }

    index<T>(constructor:interfaces.Newable<IProjectionDefinition<T>>):AreaRegistry {
        return this.add(constructor).forArea(Constants.INDEX_AREA);
    }

    add<T>(constructor:interfaces.Newable<IProjectionDefinition<T>>, parametersKey?:(parameters:any) => string):IProjectionRegistry {
        let name = Reflect.getMetadata("prettygoat:projection", constructor);
        if (!name)
            throw new Error("Missing Projection decorator");
        this.unregisteredEntries.push({ctor: constructor, name: name, parametersKey: parametersKey});
        return this;
    }

    forArea(area:string):AreaRegistry {
        let entries = _.map(this.unregisteredEntries, entry => {
            let tickScheduler = <ITickScheduler>this.tickSchedulerFactory(),
                projection = this.getDefinitionFromConstructor(entry.ctor, area, entry.name).define(tickScheduler),
                validationErrors = this.analyzer.analyze(projection);
            this.tickSchedulerHolder[projection.name] = tickScheduler;
            if (projection.split && !entry.parametersKey)
                throw new Error(`Missing parameters key function from projection ${projection.name} registration`);
            if (validationErrors.length > 0)
                throw new Error(validationErrors[0]);
            return new RegistryEntry(projection, entry.name, entry.parametersKey);
        });
        let areaRegistry = new AreaRegistry(area, entries);
        this.registry.push(areaRegistry);
        this.unregisteredEntries = [];
        if (this.hasDuplicatedEntries()) throw new Error("Cannot startup due to some projections with the same name");
        return areaRegistry;
    }

    private getDefinitionFromConstructor<T>(constructor:interfaces.Newable<IProjectionDefinition<T>>, area:string, name:string):IProjectionDefinition<T> {
        const key = `prettygoat:definitions:${area}:${name}`;
        if (!this.container.contains(key))
            this.container.set(key, constructor);
        return this.container.get<IProjectionDefinition<T>>(key);
    }

    private hasDuplicatedEntries():boolean {
        let entries = _(this.getAreas())
            .map((areaRegistry:AreaRegistry) => areaRegistry.entries)
            .concat()
            .flatten()
            .groupBy((entry:RegistryEntry<any>) => entry.projection.name)
            .valueOf();
        return _.some(entries, (entry:RegistryEntry<any>[]) => entry.length > 1);
    }

    getAreas():AreaRegistry[] {
        return this.registry;
    }

    getArea(areaId:string):AreaRegistry {
        return _.find(this.registry, (entry:AreaRegistry) => entry.area.toLowerCase() === areaId.toLowerCase());
    }

    getEntry<T>(id:string, area:string):{ area:string, data:RegistryEntry<T>} {
        let entry = null;
        if (area) {
            let areaRegistry = this.getArea(area);
            if (areaRegistry) {
                entry = _.find(areaRegistry.entries, (entry: RegistryEntry<any>) => entry.name.toLowerCase() === id.toLowerCase());
                area = areaRegistry.area;
            }
        } else {
            let areas = this.getAreas();
            _.forEach(areas, (areaRegistry:AreaRegistry) => {
                if (!entry)
                    entry = _.find(areaRegistry.entries, (entry:RegistryEntry<any>) => entry.projection.name.toLowerCase() === id.toLowerCase());
            });
        }
        return {
            area: area,
            data: entry
        };
    }
}

export default ProjectionRegistry