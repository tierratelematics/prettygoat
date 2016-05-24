import IProjectionDefinition from "../../../scripts/registry/IProjectionDefinition";
import {IProjection, AllStreamSource} from "../../../scripts/interfaces/IProjection";
import Projection from "../../../scripts/registry/ProjectionDecorator";

@Projection("Mock")
class MockProjectionDefinition implements IProjectionDefinition<number> {

    define():IProjection<number> {
        return {
            name: "test",
            streamSource: new AllStreamSource(),
            definition: {
                $init: () => 10
            }
        };
    }

}

export default MockProjectionDefinition