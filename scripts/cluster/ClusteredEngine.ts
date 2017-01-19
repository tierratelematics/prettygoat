import Engine from "../bootstrap/Engine";
import ClusterModule from "./ClusterModule";
import IProjectionEngine from "../projections/IProjectionEngine";
import ICluster from "./ICluster";
import {Observable} from "rx";

class ClusteredEngine extends Engine {

    constructor() {
        super();
        this.register(new ClusterModule());
    }

    run(overrides?: any) {
        this.boot(overrides);
        let projectionEngine = this.container.get<IProjectionEngine>("IProjectionEngine"),
            cluster = this.container.get<ICluster>("ICluster");

        Observable.merge(cluster.startup(), cluster.changes()).subscribe(() => projectionEngine.run());
    }
}

export default ClusteredEngine