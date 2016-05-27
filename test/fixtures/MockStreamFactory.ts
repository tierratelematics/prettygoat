import { IStreamFactory } from "../../scripts/streams/IStreamFactory";
import { Observable } from "rx";

export class MockStreamFactory implements IStreamFactory {
    from(lastEvent: string): Observable<any> {
        return null;
    }
}
