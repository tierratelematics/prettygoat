import {injectable} from "inversify";
import {IWhen} from "../projections/IProjection";
import * as _ from "lodash";
import IEventsFilter from "./IEventsFilter";
import {Matcher} from "../matcher/Matcher";
import {helpers} from "rx";
import ReservedEvents from "./ReservedEvents";

@injectable()
class EventsFilter implements IEventsFilter {

    private events:string[] = [];

    filter(definition:IWhen<any>):string[] {
        let eventsList:string[];
        if (definition.$any) {
            eventsList =  this.events;
        } else {
            let matcher = new Matcher(definition);
            eventsList = _(this.events).map(event => {
                return matcher.match(event) !== helpers.identity ? event : null;
            }).compact().valueOf();
            eventsList = !eventsList.length ? this.events : eventsList;
        }
        return _.union(eventsList, [ReservedEvents.TICK, ReservedEvents.REALTIME, ReservedEvents.FETCH_EVENTS]);
    }

    setEventsList(events:string[]) {
        this.events = events;
    }
}

export default EventsFilter