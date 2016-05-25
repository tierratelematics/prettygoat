import {IProjection} from "../projections/IProjection";

class RegistryEntry<T> {

    constructor(public projection:IProjection<T>, public name:string, public parameters?:any) {
    }
}

export default RegistryEntry;
