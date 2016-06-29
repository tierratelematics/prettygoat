import IProjectionDefinition from "../../../scripts/registry/IProjectionDefinition";
import {IProjection} from "../../../scripts/projections/IProjection";
import Projection from "../../../scripts/registry/ProjectionDecorator";

@Projection("Mock")
class MockProjectionDefinition implements IProjectionDefinition<number> {

    define():IProjection<number> {
        return {
            name: "test",
            definition: {
                $init: () => 20,
                OnlyEvent: (s, e) => s
            }
        };
    }

}

export default MockProjectionDefinition