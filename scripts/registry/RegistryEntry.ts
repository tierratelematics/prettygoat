import IProjectionDefinition from "./IProjectionDefinition";

class RegistryEntry<T> {

    constructor(public projection:IProjectionDefinition<T>, public name:string, public parameters?:any) {
    }
}

export default RegistryEntry;
