import {IWhen} from "../projections/IProjection";

interface IEventsFilter {
    filter(definition:IWhen<any>):string[];
    setEventsList(events:string[]);
}

export default IEventsFilter