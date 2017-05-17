import IProjectionDefinition from "../../../scripts/registry/IProjectionDefinition";
import {IProjection} from "../../../scripts/projections/IProjection";

class UnnamedProjectionDefinition implements IProjectionDefinition<number> {

    define():IProjection<number> {
        return null;
    }

}

export default UnnamedProjectionDefinition
