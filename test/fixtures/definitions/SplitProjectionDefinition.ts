import IProjectionDefinition from "../../../scripts/registry/IProjectionDefinition";
import {IProjection} from "../../../scripts/projections/IProjection";
import Projection from "../../../scripts/registry/ProjectionDecorator";

@Projection("Split")
class SplitProjectionDefinition implements IProjectionDefinition<number> {

    define():IProjection<number> {
        return {
            name: "split",
            definition: {
                $init: () => 10,
                TestEvent: (s, e:any) => s + e.count,
                LinkedState: (s, e:{ count2:number }) => s + e.count2,
                split: (s, e:any) => s + e,
                Async: (s, e:any) => Promise.resolve(s + e.count)
            },
            split: {
                TestEvent: (e:any) => e.id.toString(),
                Async: (e:any) => e.id.toString()
            }
        };
    }

}

export default SplitProjectionDefinition