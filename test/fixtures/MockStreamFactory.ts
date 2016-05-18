import { IStreamFactory } from "../../scripts/interfaces/IStreamFactory";
import { Observable } from "rx";

export class MockStreamFactory implements IStreamFactory {
    from(lastEvent: string): Observable<any> {
        return null;
    }
}
