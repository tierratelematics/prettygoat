export interface ISnapshotStrategy {
    processedEvent(lastDate: Date): void;
    needsSnapshot(): boolean;
}
