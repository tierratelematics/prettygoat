import {IReplicationManager} from "../bootstrap/ReplicationManager";
import {inject, optional} from "inversify";
import ILogger from "../log/ILogger";
import {IClusterConfig, EmbeddedClusterConfig} from "./ClusterConfig";
import * as cluster from "cluster";

class ClusteredReplicationManager implements IReplicationManager {

    constructor(@inject("ILogger") private logger: ILogger,
                @inject("IClusterConfig") @optional() private config: IClusterConfig = new EmbeddedClusterConfig()) {

    }

    canReplicate(): boolean {
        return true;
    }

    replicate() {
        for (let i = 0; i < this.config.forks; i++) {
            cluster.fork();
        }
        cluster.on('exit', (worker) => {
            this.logger.warning(`Worker ${worker.process.pid} died`);
        });
    }

    isMaster(): boolean {
        return cluster.isMaster;
    }

}

export default ClusteredReplicationManager