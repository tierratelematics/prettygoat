import {IProjection} from "../projections/IProjection";
import {interfaces} from "inversify";
import IProjectionDefinition from "./IProjectionDefinition";

class RegistryEntry<T> {

    constructor(public projection: IProjection<T>, public exposedName: string, public parametersKey?: (parameters: any) => string, public construct?: interfaces.Newable<IProjectionDefinition<T>>) {
    }
}

export default RegistryEntry;
