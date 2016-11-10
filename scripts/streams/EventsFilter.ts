import {injectable} from "inversify";
import {IWhen} from "../projections/IProjection";
import * as _ from "lodash";
import IEventsFilter from "./IEventsFilter";
import {Matcher} from "../matcher/Matcher";
import {helpers} from "rx";

@injectable()
class EventsFilter implements IEventsFilter {

    private events:string[] = [];

    filter(definition:IWhen<any>):string[] {
        if (definition.$any) return this.events;
        let matcher = new Matcher(definition);
        let list = _(this.events).map(event => {
            return matcher.match(event) !== helpers.identity ? event : null;
        }).compact().valueOf();
        return !list.length ? this.events : list;
    }

    setEventsList(events:string[]) {
        this.events = events;
    }
}

export default EventsFilter