import IProjectionDefinition from "../../../scripts/registry/IProjectionDefinition";
import {IProjection} from "../../../scripts/projections/IProjection";
import Projection from "../../../scripts/registry/ProjectionDecorator";
import ITickScheduler from "../../../scripts/ticks/ITickScheduler";
import Tick from "../../../scripts/ticks/Tick";
import * as moment from "moment";

@Projection("Tick")
class TickProjectionDefinition implements IProjectionDefinition<Tick> {

    constructor() {

    }

    define(tickScheduler:ITickScheduler):IProjection<Tick> {
        return {
            name: "Tick",
            definition: {
                $init: () => new Tick(new Date(0)),
                TickTrigger: (state:Tick, event) => {
                    tickScheduler.schedule(moment(state.clock).add(100, 'milliseconds').toDate());
                    return state;
                },
                TickBetweenTrigger: (state:Tick, event) => {
                    tickScheduler.schedule(moment(state.clock).add(100, 'milliseconds').toDate(), "GENERATE_TICK");
                    return state;
                },
                Tick: (state, event:Tick) => {
                    if (event.state === "GENERATE_TICK")
                        tickScheduler.schedule(moment(event.clock).add(100, 'milliseconds').toDate());
                    return event;
                },
                OtherEvent: (state, event, completeEvent) => new Tick(completeEvent.timestamp || new Date(0)),
                SplitTrigger: (state:Tick, payload, event) => {
                    tickScheduler.schedule(moment(state.clock).add(100, 'milliseconds').toDate(), null, event.splitKey);
                    return new Tick(event.timestamp);
                },
                FutureTick: (state, payload, event) => {
                    tickScheduler.schedule(new Date(500));
                    return state;
                }
            },
            split: {
                SplitTrigger: (event:{id:string}) => event.id,
                Tick: (payload, event) => event.splitKey
            }
        };
    }

}

export default TickProjectionDefinition