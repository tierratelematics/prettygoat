import RegistryEntry from "./RegistryEntry";

class AreaRegistry {
    constructor(public area:string, public entries:RegistryEntry<any>[]) {
    }
}

export default AreaRegistry;
