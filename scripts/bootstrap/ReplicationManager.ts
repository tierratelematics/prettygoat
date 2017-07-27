import {injectable} from "inversify";

export interface IReplicationManager {
    canReplicate(): boolean;
    replicate();
    isMaster(): boolean;
}

@injectable()
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
