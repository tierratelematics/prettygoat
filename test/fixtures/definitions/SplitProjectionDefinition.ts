import IProjectionDefinition from "../../../scripts/registry/IProjectionDefinition";
import {IProjection, AllStreamSource} from "../../../scripts/projections/IProjection";
import Projection from "../../../scripts/registry/ProjectionDecorator";

@Projection("Split")
class SplitProjectionDefinition implements IProjectionDefinition<number> {

    define():IProjection<number> {
        return {
            name: "test",
            streamSource: new AllStreamSource(),
            definition: {
                $init: () => 10,
                TestEvent: (s, e:any) => s + e.count,
                LinkedState: (s, e:{ count2:number }) => s + e.count2
            },
            split: {
                TestEvent: (e:any) => e.id
            },
            parametersKey: (p:any) => p.id
        };
    }

}

export default SplitProjectionDefinition