import IProjectionDefinition from "../../../scripts/registry/IProjectionDefinition";
import {IProjection} from "../../../scripts/projections/IProjection";
import {ISnapshotStrategy} from "../../../scripts/snapshots/ISnapshotStrategy";
import {injectable} from "inversify";

@injectable()
class MockProjectionDefinition implements IProjectionDefinition<number> {

    constructor(private strategy?: ISnapshotStrategy) {

    }

    define(): IProjection<number> {
        return {
            name: "Mock",
            definition: {
                $init: () => 10,
                TestEvent: (s, e: number) => s + e
            },
            snapshot: this.strategy,
            publish: {
                "Test": {}
            }
        };
    }

}

export default MockProjectionDefinition
