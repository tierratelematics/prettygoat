import {injectable, inject} from "inversify";
import {IWhen} from "../projections/IProjection";
import * as _ from "lodash";
import IEventsFilter from "./IEventsFilter";
import {Matcher} from "../matcher/Matcher";
import {helpers} from "rx";

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
        }
        return eventsList;
    }

    setEventsList(events:string[]) {
        this.events = events;
    }
}

export default EventsFilter