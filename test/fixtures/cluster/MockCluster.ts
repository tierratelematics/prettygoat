import ICluster from "../../../scripts/cluster/ICluster";
import {Observable} from "rx";
import {IncomingMessage} from "http";
import {ServerResponse} from "http";
import {RequestData} from "../../../scripts/web/IRequestComponents";

class MockCluster implements ICluster {
    changes(): Observable<void> {
        return undefined;
    }

    startup(): Observable<void> {
        return undefined;
    }

    whoami(): string {
        return undefined;
    }

    lookup(key): string {
        return undefined;
    }

    handleOrProxy(key: string, request: IncomingMessage, response: ServerResponse): boolean {
        return false;
    }

    requests(): Observable<RequestData> {
        return undefined;
    }
}

export default MockCluster