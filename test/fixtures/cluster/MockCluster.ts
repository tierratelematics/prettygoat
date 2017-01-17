import ICluster from "../../../scripts/cluster/ICluster";
import ClusterMessage from "../../../scripts/cluster/ClusterMessage";
import {Observable} from "rx";

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

    handleOrForward(key) {
    }

    requests(): Observable<ClusterMessage> {
        return undefined;
    }
}

export default MockCluster