import IEventsFilter from "../../scripts/streams/IEventsFilter";
import {IWhen} from "../../scripts/projections/IProjection";

export default class MockEventsFilter implements IEventsFilter {
    filter(definition:IWhen<any>):string[] {
        return null;
    }

    setEventsList(events:string[]) {

    }
}