import IProjectionDefinition from "../../../scripts/registry/IProjectionDefinition";
import {IProjection} from "../../../scripts/projections/IProjection";
import Projection from "../../../scripts/registry/ProjectionDecorator";

@Projection("Bad")
class BadNotificationProjection implements IProjectionDefinition<number> {

    constructor() {

    }

    define(): IProjection<number> {
        return {
            name: "test",
            definition: {
                $init: () => 10,
                TestEvent: (s, e: number) => s + e,
                TestEvent2: (s, e: number) => s + e,
            },
            notification: {
                TestEvent: (s, e) => null
            }
        };
    }

}

export default BadNotificationProjection
