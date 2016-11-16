import IProjectionDefinition from "../../../scripts/registry/IProjectionDefinition";
import {IProjection} from "../../../scripts/projections/IProjection";
import Projection from "../../../scripts/registry/ProjectionDecorator";
import CountSnapshotStrategy from "../../../scripts/snapshots/CountSnapshotStrategy";
import {ISnapshotStrategy} from "../../../scripts/snapshots/ISnapshotStrategy";

@Projection("CircularA")
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

@Projection("CircularB")
export class MockProjectionCircularBDefinition implements IProjectionDefinition<number> {

    define():IProjection<number> {
        return {
            name: "CircularB",
            definition: {
                $init: () => 10,
                "CircularA": (s, e:number) => s + e,
                TestEvent: (s, e:number) => s + e
            }
        };
    }

}
