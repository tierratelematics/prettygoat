import Engine from "../bootstrap/Engine";
import ClusterModule from "./ClusterModule";
import IProjectionEngine from "../projections/IProjectionEngine";
import ICluster from "./ICluster";
import {IRequestAdapter} from "../web/IRequestComponents";
const express = require("express");

class ClusteredEngine extends Engine {

    constructor() {
        super();
        this.register(new ClusterModule());
    }

    run(overrides?: any) {
        this.boot(overrides);
        let projectionEngine = this.container.get<IProjectionEngine>("IProjectionEngine"),
            cluster = this.container.get<ICluster>("ICluster"),
            requestAdapter = this.container.get<IRequestAdapter>("IRequestAdapter");

        cluster.startup()
            .do(() => {
                cluster.requests().subscribe(message => {
                    message.request.__proto__ = express.request;
                    message.response.__proto__ = express.response;
                    requestAdapter.route(message.request, message.response);
                })
            })
            .merge(cluster.changes())
            .subscribe(() => projectionEngine.run());
    }
}

export default ClusteredEngine