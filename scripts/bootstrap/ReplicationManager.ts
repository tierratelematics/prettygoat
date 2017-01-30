export interface IReplicationManager {
    canReplicate(): boolean;
    replicate();
    isMaster(): boolean;
}

export class ReplicationManager implements IReplicationManager {

    canReplicate(): boolean {
        return false;
    }

    replicate() {

    }

    isMaster(): boolean {
        return false;
    }

}