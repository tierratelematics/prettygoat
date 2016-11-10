import IProjectionDefinition from "../../../scripts/registry/IProjectionDefinition";
import {IProjection} from "../../../scripts/projections/IProjection";
import Projection from "../../../scripts/registry/ProjectionDecorator";
import ITickScheduler from "../../../scripts/ticks/ITickScheduler";
import Tick from "../../../scripts/ticks/Tick";
import * as moment from "moment";

@Projection("Tick")
class InitTickProjectionDefinition implements IProjectionDefinition<Tick> {

    constructor() {

    }

    define(tickScheduler:ITickScheduler):IProjection<Tick> {
        return {
            name: "Tick",
            definition: {
                $init: () => {
                    tickScheduler.schedule(new Date(100));
                    return new Tick(new Date(0));
                },
                Tick: (state, event:Tick) => {
                    return event;
                },
                OtherEvent: (state, event, completeEvent) => new Tick(completeEvent.timestamp || new Date(0))
            }
        };
    }

}

export default InitTickProjectionDefinition