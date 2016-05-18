import { Observable } from "rx";

export interface IStreamFactory {
    from(lastEvent: string): Observable<any>;
}
