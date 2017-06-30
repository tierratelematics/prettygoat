import {Observable} from "rx";
import {Event} from "./Event";
import {WhenBlock} from "../projections/Matcher";

export interface IStreamFactory {
    from(lastEvent: Date, completions?: Observable<string>, definition?: WhenBlock<any>): Observable<Event>;
}
