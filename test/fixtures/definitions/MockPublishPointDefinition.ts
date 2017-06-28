import IProjectionDefinition from "../../../scripts/registry/IProjectionDefinition";
import {IProjection} from "../../../scripts/projections/IProjection";
import {injectable} from "inversify";

@injectable()
class MockPublishPointDefinition implements IProjectionDefinition<number> {

    constructor() {

    }

    define(): IProjection<number> {
        return {
            name: "Publish",
            definition: {
                $init: () => 10,
                TestEvent: (s, e: number) => s + e
            },
            publish: {
                "Test": {}
            }
        };
    }

}

export default MockPublishPointDefinition
