import IProjectionDefinition from "../../../scripts/registry/IProjectionDefinition";
import {IProjection} from "../../../scripts/projections/IProjection";
import Projection from "../../../scripts/registry/ProjectionDecorator";
import {injectable} from "inversify";

@injectable()
class BadNotificationProjection implements IProjectionDefinition<number> {

    constructor() {

    }

    define(): IProjection<number> {
        return {
            name: "Bad",
            definition: {
                $init: () => 10,
                TestEvent: (s, e: number) => s + e,
                TestEvent2: (s, e: number) => s + e,
            },
            publish: {
                "List": {
                    notify: {
                        TestEvent: (s, e) => null,
                        TestEvent2: (s, e) => null,
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

export default BadNotificationProjection
