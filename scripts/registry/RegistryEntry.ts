import PushContext from "../push/PushContext";
import IProjectionDefinition from "./IProjectionDefinition";

class RegistryEntry<T> {

    constructor(public projection:IProjectionDefinition<T>,
                public name:string,
                public context:PushContext) {
    }
}

export default RegistryEntry;
