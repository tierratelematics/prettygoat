import {IProjection} from "../projections/IProjection";

class RegistryEntry<T> {

    constructor(public projection:IProjection<T>, public exposedName:string, public parametersKey?:(parameters:any) => string) {
    }
}

export default RegistryEntry;
