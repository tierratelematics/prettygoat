import ILookup from "./ILookup";

interface ILookupFactory {
    lookupFor(projectionName: string): ILookup;
}

export default ILookupFactory