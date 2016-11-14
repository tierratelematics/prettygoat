import IProjectionDefinition from "../../../scripts/registry/IProjectionDefinition";
import {IProjection} from "../../../scripts/projections/IProjection";
import Projection from "../../../scripts/registry/ProjectionDecorator";
import CountSnapshotStrategy from "../../../scripts/snapshots/CountSnapshotStrategy";
import {ISnapshotStrategy} from "../../../scripts/snapshots/ISnapshotStrategy";

@Projection("Mock")
export class MockProjectionCircularADefinition implements IProjectionDefinition<number> {

    define():IProjection<number> {
        return {
            name: "CircularA",
            definition: {
                $init: () => 10,
                "CircularB": (s, e:number) => s + e,
                TestEvent: (s, e:number) => s + e
            }
        };
    }

}
