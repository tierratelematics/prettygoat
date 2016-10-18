import IProjectionDefinition from "../../../scripts/registry/IProjectionDefinition";
import {IProjection} from "../../../scripts/projections/IProjection";
import Projection from "../../../scripts/registry/ProjectionDecorator";
import ITickScheduler from "../../../scripts/ticks/ITickScheduler";

@Projection("Tick")
class TickProjectionDefinition implements IProjectionDefinition<number> {

    constructor() {

    }

    define(tickScheduler:ITickScheduler):IProjection<number> {
        return {
            name: "Tick",
            definition: {}
        };
    }

}

export default TickProjectionDefinition