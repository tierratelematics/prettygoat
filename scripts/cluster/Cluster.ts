import ICluster from "./ICluster";
import {inject, injectable, optional} from "inversify";
import {Observable} from "rx";
import {EmbeddedClusterConfig} from "./ClusterConfig";
import {IRequestParser, RequestData, IMiddlewareTransformer} from "../web/IRequestComponents";
import {IncomingMessage} from "http";
import {ServerResponse} from "http";
import ILogger from "../log/ILogger";
import PortDiscovery from "../util/PortDiscovery";
const Ringpop = require('ringpop');
const TChannel = require('tchannel');

@injectable()
class Cluster implements ICluster {
    ringpop: any;
    requestSource: Observable<RequestData>;

    constructor(@inject("IClusterConfig") @optional() private clusterConfig = new EmbeddedClusterConfig(),
                @inject("IRequestParser") private requestParser: IRequestParser,
                @inject("IMiddlewareTransformer") private middlewareTransformer: IMiddlewareTransformer,
                @inject("ILogger") private logger: ILogger) {

    }

    startup(): Observable<void> {
        return Observable.create<void>(observer => {
            PortDiscovery.freePort(this.clusterConfig.port, this.clusterConfig.host).then(port => {
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

    whoami(): string {
        return this.ringpop.whoami();
    }

    lookup(key: string): string {
        return this.ringpop.lookup(key);
    }

    handleOrProxy(key: string, request: IncomingMessage, response: ServerResponse): boolean {
        return this.ringpop.handleOrProxy(key, request, response);
    }

    handleOrProxyToAll(keys: string[], request: IncomingMessage) {
        this.ringpop.handleOrProxyAll({
            keys: keys,
            req: request
        });
    }

    requests(): Observable<RequestData> {
        if (!this.requestSource) {
            this.requestSource = Observable.create(observer => {
                this.ringpop.on('request', (request, response) => {
                    let requestData = this.requestParser.parse(request, response);
                    this.middlewareTransformer.transform(requestData[0], requestData[1]).then(data => {
                        observer.onNext(data)
                    });
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