import { Observable } from "rx";
import {Event} from "./Event";

export interface IStreamFactory {
    from(lastEvent: Date): Observable<Event>;
}
