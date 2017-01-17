import ICluster from "../../../scripts/cluster/ICluster";
import ClusterMessage from "../../../scripts/cluster/ClusterMessage";
import {Observable} from "rx";
import {ClientRequest} from "http";
import {ServerResponse} from "http";

class MockCluster implements ICluster {

    startup(): Observable<void> {
        return undefined;
    }

    whoami(): string {
        return undefined;
    }

    lookup(key): string {
        return undefined;
    }

    handleOrProxy(key: string, request: ClientRequest, response: ServerResponse):boolean {
        return false;
    }

    requests(): Observable<ClusterMessage> {
        return undefined;
    }
}

export default MockCluster