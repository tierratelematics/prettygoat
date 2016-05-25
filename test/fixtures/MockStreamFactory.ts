import { IStreamFactory } from "../../scripts/projections/IStreamFactory";
import { Observable } from "rx";

export class MockStreamFactory implements IStreamFactory {
    from(lastEvent: string): Observable<any> {
        return null;
    }
}
