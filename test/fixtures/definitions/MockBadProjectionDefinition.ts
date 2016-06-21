import IProjectionDefinition from "../../../scripts/registry/IProjectionDefinition";
import {IProjection} from "../../../scripts/projections/IProjection";
import Projection from "../../../scripts/registry/ProjectionDecorator";

@Projection("Mock")
class MockBadProjectionDefinition implements IProjectionDefinition<number> {

    define():IProjection<number> {
        return <any>{
            definition: {
                $init: () => 10
            }
        };
    }

}

export default MockBadProjectionDefinition