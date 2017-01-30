import ICluster from "./ICluster";
import {inject, injectable, optional} from "inversify";
import {Observable} from "rx";
import {EmbeddedClusterConfig} from "./ClusterConfig";
import {IRequestParser, RequestData} from "../web/IRequestComponents";
import {IncomingMessage} from "http";
import {ServerResponse} from "http";
const portUsed = require("tcp-port-used");
import ILogger from "../log/ILogger";
const Ringpop = require('ringpop');
const TChannel = require('tchannel');

@injectable()
class Cluster implements ICluster {
    ringpop: any;
    requestSource: Observable<RequestData>;

    constructor(@inject("IClusterConfig") @optional() private clusterConfig = new EmbeddedClusterConfig(),
                @inject("IRequestParser") private requestParser: IRequestParser,
                @inject("ILogger") private logger: ILogger) {

    }

    startup(): Observable<void> {
        return Observable.create<void>(observer => {
            this.getFreeTCPPort(this.clusterConfig.port, this.clusterConfig.host).then(port => {
                let tchannel = new TChannel();
                this.ringpop = new Ringpop({
                    app: "ringpop",
                    hostPort: `${this.clusterConfig.host}:${port}`,
                    channel: tchannel.makeSubChannel({
                        serviceName: 'ringpop',
                        trace: false
                    })
                });
                this.ringpop.setupChannel();
                tchannel.listen(port, this.clusterConfig.host, () => {
                    this.logger.info(`TChannel listening on ${port}`);
                    this.ringpop.bootstrap(this.clusterConfig.nodes, () => {
                        observer.onNext(null);
                        observer.onCompleted();
                    });
                });
            });
        });
    }

    private getFreeTCPPort(initialPort: number, host: string): Promise<number> {
        return portUsed.check({
            port: initialPort,
            host: host
        }).then(used => {
            return used ? this.getFreeTCPPort(initialPort + 1, host) : initialPort;
        });
    }

    whoami(): string {
        return this.ringpop.whoami();
    }

    lookup(key: string): string {
        return this.ringpop.lookup(key);
    }

    handleOrProxy(key: string, request: IncomingMessage, response: ServerResponse): boolean {
        return this.ringpop.handleOrProxy(key, request, response);
    }

    handleOrProxyToAll(keys: string[], request: IncomingMessage): boolean {
        return this.ringpop.handleOrProxyAll({
            keys: keys,
            req: request
        });
    }

    requests(): Observable<RequestData> {
        if (!this.requestSource) {
            this.requestSource = Observable.create(observer => {
                this.ringpop.on('request', (request, response) => {
                    this.requestParser.parse(request, response).then(requestData => observer.onNext(requestData));
                });
            }).share();
        }
        return this.requestSource;
    }

    changes(): Observable<void> {
        return Observable.fromEvent<void>(this.ringpop, 'ringChanged');
    }

}

export default Cluster