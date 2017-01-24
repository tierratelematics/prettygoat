import Engine from "../bootstrap/Engine";
import ClusterModule from "./ClusterModule";
import IProjectionEngine from "../projections/IProjectionEngine";
import ICluster from "./ICluster";
import {IRequestAdapter, IMessageParser} from "../web/IRequestComponents";
import {IncomingMessage} from "http";
import {ServerResponse} from "http";

class ClusteredEngine extends Engine {

    constructor() {
        super();
        this.register(new ClusterModule());
    }

    run(overrides?: any) {
        this.boot(overrides);
        let projectionEngine = this.container.get<IProjectionEngine>("IProjectionEngine"),
            cluster = this.container.get<ICluster>("ICluster"),
            requestAdapter = this.container.get<IRequestAdapter>("IRequestAdapter"),
            messageParser = this.container.get<IMessageParser<IncomingMessage, ServerResponse>>("ClusterMessageParser");

        cluster.startup().subscribe(() => {
            projectionEngine.run();
            cluster.requests().subscribe(message => {
                let context = messageParser.parse(message.request, message.response);
                requestAdapter.route(context[0], context[1]);
            })
        });
        cluster.changes().subscribe(() => projectionEngine.run());
    }
}

export default ClusteredEngine