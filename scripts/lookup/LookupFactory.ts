import ILookupFactory from "./ILookupFactory";
import ILookup from "./ILookup";
import Lookup from "./Lookup";
import Dictionary from "../util/Dictionary";

class LookupFactory implements ILookupFactory {

    private cache: Dictionary<Lookup> = {};

    lookupFor(projectionName: string): ILookup {
        let cached = this.cache[projectionName];
        if (!cached) {
            cached = this.cache[projectionName] = new Lookup();
            cached.setProjectionName(projectionName);
        }
        return cached;
    }

}

export default LookupFactory