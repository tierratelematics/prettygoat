import IProjectionDefinition from "../../../scripts/registry/IProjectionDefinition";
import {IProjection} from "../../../scripts/projections/IProjection";
import Projection from "../../../scripts/registry/ProjectionDecorator";

@Projection("Dynamic")
class DynamicNameProjection implements IProjectionDefinition<any> {

    constructor(private name: string) {

    }

    define(): IProjection<any> {
        return {
            name: this.name,
            definition: {}
        }
    }

}

export default DynamicNameProjection