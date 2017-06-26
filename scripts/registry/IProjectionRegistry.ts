import AreaRegistry from "./AreaRegistry";
import IProjectionDefinition from "./IProjectionDefinition";
import {interfaces} from "inversify";
import {IReadModelDefinition} from "../readmodels/IReadModel";
import {IProjection} from "../projections/IProjection";

interface IProjectionRegistry {
    master<T>(constructor: interfaces.Newable<IProjectionDefinition<T>>): AreaRegistry;
    index<T>(constructor: interfaces.Newable<IProjectionDefinition<T>>): AreaRegistry;
    readmodel<T>(constructor: interfaces.Newable<IReadModelDefinition<T>>): AreaRegistry;
    add<T>(constructor: interfaces.Newable<IProjectionDefinition<T>>): IProjectionRegistry;
    forArea(area: string): AreaRegistry;
    getAreas(): AreaRegistry[];
    getEntry<T>(name: string, area?: string): [string, IProjection<T>]; // area, projection
}

export default IProjectionRegistry;
