import ILookupFactory from "./ILookupFactory";
import ILookup from "./ILookup";
import Lookup from "./Lookup";
import Dictionary from "../util/Dictionary";
import IProjectionDefinition from "../registry/IProjectionDefinition";
import {inject, injectable} from "inversify";
import IReadModelFactory from "../streams/IReadModelFactory";
import LookupModel from "./LookupModel";

@injectable()
class LookupFactory implements ILookupFactory {

    private cache: Dictionary<Lookup> = {};

    constructor(@inject("IReadModelFactory") private readModelFactory: IReadModelFactory) {

    }

    lookupFor<T extends IProjectionDefinition<LookupModel>>(projectionName: string): ILookup {
        let cached = this.cache[projectionName];
        if (!cached) {
            cached = this.cache[projectionName] = new Lookup(this.readModelFactory);
            cached.setProjectionName(projectionName);
        }
        return cached;
    }

}

export default LookupFactory