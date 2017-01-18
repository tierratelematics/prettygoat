import ICluster from "./ICluster";
import {inject, injectable, optional} from "inversify";
import ClusterMessage from "./ClusterMessage";
import {Observable} from "rx";
import {EmbeddedClusterConfig} from "./ClusterConfig";
import {ServerResponse} from "http";
import {ClientRequest} from "http";
const Ringpop = require('ringpop');
const TChannel = require('tchannel');

@injectable()
class Cluster implements ICluster {
    ringpop: any;

    constructor(@inject("IClusterConfig") @optional() private clusterConfig = new EmbeddedClusterConfig()) {

    }


    startup(): Observable<void> {
        return Observable.create<void>(observer => {
            let tchannel = new TChannel();
            this.ringpop = new Ringpop({
                app: "ringpop",
                hostPort: `${this.clusterConfig.host}:${this.clusterConfig.port}`,
                channel: tchannel.makeSubChannel({
                    serviceName: 'ringpop',
                    trace: false
                })
            });
            this.ringpop.setupChannel();
            tchannel.listen(this.clusterConfig.port, this.clusterConfig.host, () => {
                this.ringpop.bootstrap(this.clusterConfig.nodes, () => {
                    observer.onNext(null);
                    observer.onCompleted();
                });
            });
        });
    }

    whoami(): string {
        return this.ringpop.whoami();
    }

    lookup(key: string): string {
        return this.ringpop.lookup(key);
    }

    handleOrProxy(key: string, request: ClientRequest, response: ServerResponse): boolean {
        return this.ringpop.handleOrProxy(key, request, response);
    }

    requests(): Observable<ClusterMessage> {
        return Observable.fromEvent(this.ringpop, 'request', (args:any[]) => {
            return {request: args[0], response: args[1]};
        });
    }

    changes(): Observable<void> {
        return Observable.fromEvent(this.ringpop, 'ringChanged');
    }

}

export default Cluster