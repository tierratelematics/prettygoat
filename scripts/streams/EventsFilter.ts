import {injectable} from "inversify";
import {IWhen} from "../projections/IProjection";
import * as _ from "lodash";

@injectable()
class EventsFilter {

    filter(definition:IWhen<any>):string[] {
        if (definition.$any) return [];
        return _(definition).map((value, key) => key !== "$init" ? key : null).compact().valueOf();
    }
}

export default EventsFilter