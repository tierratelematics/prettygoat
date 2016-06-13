import IProjectionDefinition from "../../../scripts/registry/IProjectionDefinition";
import {IProjection, AllStreamSource} from "../../../scripts/projections/IProjection";
import Projection from "../../../scripts/registry/ProjectionDecorator";

@Projection("Mock")
class LinkedProjectionDefinition implements IProjectionDefinition<number> {

    define():IProjection<number> {
        return {
            name: "test",
            streamSource: new AllStreamSource(),
            definition: {
                $init: () => 10,
                Test: (s, e) => s + e.count
            },
            dependencies: ["Stream1", "Stream2"]
        };
    }

}

export default LinkedProjectionDefinition