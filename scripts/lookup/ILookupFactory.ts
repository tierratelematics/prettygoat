import ILookup from "./ILookup";
import IProjectionDefinition from "../registry/IProjectionDefinition";
import LookupModel from "./LookupModel";

interface ILookupFactory {
    lookupFor<T extends IProjectionDefinition<LookupModel>>(projectionName: string): ILookup;
}

export default ILookupFactory