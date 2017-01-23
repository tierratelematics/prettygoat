import ICluster from "./ICluster";
import {inject, injectable, optional} from "inversify";
import ClusterMessage from "./ClusterMessage";
import {Observable} from "rx";
import {EmbeddedClusterConfig} from "./ClusterConfig";
import {Request, Response} from "express";
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

    handleOrProxy(key: string, request: Request, response: Response): boolean {
        return this.ringpop.handleOrProxy(key, request, response);
    }

    requests(): Observable<ClusterMessage> {
        return Observable.create(observer => {
            this.ringpop.on('request', (request, response) => {
                observer.onNext({
                    request: request,
                    response: response
                });
            });
        });
    }

    changes(): Observable<void> {
        return Observable.fromEvent<void>(this.ringpop, 'ringChanged');
    }

}

export default Cluster