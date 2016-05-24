import {IProjection} from "../interfaces/IProjection";
import PushContext from "../push/PushContext";

class RegistryEntry<T> {

    constructor(public projection:IProjection<T>,
                public name:string,
                public context:PushContext) {
    }
}

export default RegistryEntry;
