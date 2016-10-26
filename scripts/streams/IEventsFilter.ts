import {IWhen} from "../projections/IProjection";

interface IEventsFilter {
    filter(definition:IWhen<any>):string[];
}

export default IEventsFilter