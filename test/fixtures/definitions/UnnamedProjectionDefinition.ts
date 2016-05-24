import IProjectionDefinition from "../../../scripts/registry/IProjectionDefinition";
import {IProjection} from "../../../scripts/interfaces/IProjection";

class UnnamedProjectionDefinition implements IProjectionDefinition<number> {

    define():IProjection<number> {
        return null;
    }

}

export default UnnamedProjectionDefinition