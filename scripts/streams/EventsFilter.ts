import {injectable} from "inversify";
import {IWhen} from "../projections/IProjection";

@injectable();
class EventsFilter {
    filter(definition:IWhen<any>):string[] {
        return null;
    }
}

export default EventsFilter