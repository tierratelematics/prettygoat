import ICluster from "../../../scripts/cluster/ICluster";

class MockCluster implements ICluster {

    startup(): Rx.Observable<void> {
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

}

export default MockCluster