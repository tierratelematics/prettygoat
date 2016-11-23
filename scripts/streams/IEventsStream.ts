import {Observable} from "rx";
import {Event} from "./Event";

export interface IEventsStream {
    stream():Observable<Event>;
}
