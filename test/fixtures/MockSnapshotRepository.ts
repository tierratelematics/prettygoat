import { ISnapshotRepository, Snapshot } from "../../scripts/projections/ISnapshotRepository";

export class MockSnapshotRepository implements ISnapshotRepository {
    getSnapshot<T>(streamId: string): Snapshot<T> {
        return null;
    }
    saveSnapshot<T>(streamId: string, snapshot: Snapshot<T>): void {
    }
}
