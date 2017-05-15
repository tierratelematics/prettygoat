import IProjectionDefinition from "../../../scripts/registry/IProjectionDefinition";
import {IProjection} from "../../../scripts/projections/IProjection";
import Projection from "../../../scripts/registry/ProjectionDecorator";
import Private from "../../../scripts/registry/PrivateDecorator";

@Projection("Closed")
@Private()
class PrivateProjectionDefinition implements IProjectionDefinition<any> {

    define(): IProjection<any> {
        return {
            name: "Closed",
            definition: {}
        };
    }

}

export default PrivateProjectionDefinition
