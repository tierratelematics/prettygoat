import {IProjectionRunner} from "../../scripts/projections/IProjectionRunner";
import {Snapshot} from "../../scripts/snapshots/ISnapshotRepository";
import {ProjectionStats} from "../../scripts/projections/ProjectionRunner";

class MockProjectionRunner<T> implements IProjectionRunner<T> {
    state: T;
    closed = false;
    stats = new ProjectionStats();

    notifications() {
        return null;
    }

    run(snapshot?: Snapshot<T>): void {

    }

    stop(): void {
    }

    pause(): void {
    }

    resume(): void {
    }

    unsubscribe(): void {

    }

}

export default MockProjectionRunner
