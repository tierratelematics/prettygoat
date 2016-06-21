import { Observable } from "rx";
import Event from "../events/Event";

export interface IStreamFactory {
    from(lastEvent: string): Observable<Event>;
}
