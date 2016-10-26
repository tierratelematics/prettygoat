import {Observable} from "rx";
import {Event} from "./Event";

export interface IStreamFactory {
    from(lastEvent:Date, events?:string[]):Observable<Event>;
}
