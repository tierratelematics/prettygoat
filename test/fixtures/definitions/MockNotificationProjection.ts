import {IProjection, IProjectionDefinition} from "../../../scripts/projections/IProjection";
import {injectable} from "inversify";

@injectable()
class MockNotificationProjection implements IProjectionDefinition<number> {

    constructor() {

    }

    define(): IProjection<number> {
        return {
            name: "Mock",
            definition: {
                $init: () => 10,
                TestEvent: (s, e: number) => s + e
            },
            publish: {
                "List": {
                    notify: {
                        TestEvent: (s, e) => null
                    }
                },
                "Detail": {
                    notify: {
                        TestEvent: (s, e) => null
                    }
                }
            }
        };
    }

}

export default MockNotificationProjection
