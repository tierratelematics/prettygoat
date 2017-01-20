import ICluster from "../../../scripts/cluster/ICluster";
import ClusterMessage from "../../../scripts/cluster/ClusterMessage";
import {Observable} from "rx";
import {Request, Response} from "express";

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

    handleOrProxy(key: string, request: Request, response: Response):boolean {
        return false;
    }

    requests(): Observable<ClusterMessage> {
        return undefined;
    }
}

export default MockCluster