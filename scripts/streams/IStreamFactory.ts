import {Observable} from "rx";
import {Event} from "./Event";
import {IWhen} from "../projections/IProjection";

export interface IStreamFactory {
    from(lastEvent:Date, completions?:Observable<void>, definition?:IWhen<any>):Observable<Event[]>;
}
