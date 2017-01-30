import Engine from "../bootstrap/Engine";
import ClusterModule from "./ClusterModule";
import IProjectionEngine from "../projections/IProjectionEngine";
import ICluster from "./ICluster";
import {IRequestAdapter} from "../web/IRequestComponents";
import {IReplicationManager} from "../bootstrap/ReplicationManager";

class ClusteredEngine extends Engine {

    constructor() {
        super();
        this.register(new ClusterModule());
    }

    run(overrides?: any) {
        this.boot(overrides);
        let replicationManager = this.container.get<IReplicationManager>("IReplicationManager");
        if (replicationManager.isMaster())
            return;

        let projectionEngine = this.container.get<IProjectionEngine>("IProjectionEngine"),
            cluster = this.container.get<ICluster>("ICluster"),
            requestAdapter = this.container.get<IRequestAdapter>("IRequestAdapter");

        cluster.startup().subscribe(() => {
            projectionEngine.run();
            cluster.requests().subscribe(message => {
                requestAdapter.route(message[0], message[1]);
            });
            cluster.changes().subscribe(() => projectionEngine.run());
        });
    }
}

export default ClusteredEngine