import IProjectionDefinition from "../../../scripts/registry/IProjectionDefinition";
import {IProjection} from "../../../scripts/projections/IProjection";
import Projection from "../../../scripts/registry/ProjectionDecorator";
import {ISnapshotStrategy} from "../../../scripts/snapshots/ISnapshotStrategy";

@Projection("MockProjectionRunner")
class MockProjectionRunnerDefinition implements IProjectionDefinition<number> {

    constructor(private strategy?:ISnapshotStrategy) {
    }

    define():IProjection<number> {
        return {
            name: "test",
            definition: {
                test2: (s, e:number) => s + e
            },
            snapshotStrategy: this.strategy
        };
    }

}

export default MockProjectionRunnerDefinition