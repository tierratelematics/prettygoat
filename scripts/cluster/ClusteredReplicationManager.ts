import {IReplicationManager} from "../bootstrap/ReplicationManager";
import {inject, optional, injectable} from "inversify";
import ILogger from "../log/ILogger";
import {IClusterConfig, EmbeddedClusterConfig} from "./ClusterConfig";
import * as cluster from "cluster";

@injectable()
class ClusteredReplicationManager implements IReplicationManager {

    constructor(@inject("ILogger") private logger: ILogger,
                @inject("IClusterConfig") @optional() private config: IClusterConfig = new EmbeddedClusterConfig()) {

    }

    canReplicate(): boolean {
        return true;
    }

    replicate() {
        //Spawn children after every 500ms (required to correctly bind to free tcp ports)
        for (let i = 0; i < this.config.forks; i++) {
            setTimeout(() => {
                cluster.fork();
            }, i * 500);
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