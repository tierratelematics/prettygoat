import {IProjectionRunner} from "../../scripts/projections/IProjectionRunner";
import {Subject} from "rx";
import {Event} from "../../scripts/events/Event";
import ProjectionStats from "../../scripts/projections/ProjectionStats";
import {Snapshot} from "../../scripts/snapshots/ISnapshotRepository";

class MockProjectionRunner<T> implements IProjectionRunner<T> {
    state: T;
    stats = new ProjectionStats();
    private subject: Subject<Event>;

    constructor(data?: Subject<Event>) {
        this.subject = data;
    }

    notifications() {
        return this.subject;
    }

    run(snapshot?: Snapshot<T>): void {

    }

    stop(): void {
    }

    pause(): void {
    }

    resume(): void {
    }

    dispose(): void {

    }

}

export default MockProjectionRunner