import "reflect-metadata";
import {Container} from "inversify";
import IModule from "./IModule";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import * as _ from "lodash";
import PrettyGoatModule from "./PrettyGoatModule";
import IProjectionEngine from "../projections/IProjectionEngine";
import IEndpointConfig from "../configs/IEndpointConfig";
import ILogger from "../log/ILogger";
import {FeatureChecker} from "bivio";
import {IFeatureChecker} from "bivio";
import {server, app} from "../web/ExpressApp";
import ISocketConfig from "../configs/ISocketConfig";
import APIModule from "../api/APIModule";
import {IClientRegistry, IPushNotifier, ISocketFactory} from "../push/IPushComponents";
import SocketClient from "../push/SocketClient";
import {IRequestAdapter, IRequestParser} from "../web/IRequestComponents";
import {IReplicationManager} from "./ReplicationManager";
import PortDiscovery from "../util/PortDiscovery";
import PushContext from "../push/PushContext";

class Engine {

    protected container = new Container();
    private modules: IModule[] = [];
    private featureChecker = new FeatureChecker();

    constructor() {
        this.register(new PrettyGoatModule());
        this.register(new APIModule());
        this.container.bind<IFeatureChecker>("IFeatureChecker").toConstantValue(this.featureChecker);
    }

    register(module: IModule): boolean {
        if (!this.featureChecker.canCheck(module.constructor) || this.featureChecker.check(module.constructor)) {
            if (module.modules)
                module.modules(this.container);
            this.modules.push(module);
            return true;
        }
        return false;
    }

    boot(overrides?: any) {
        let replicationManager = this.container.get<IReplicationManager>("IReplicationManager");

        if (!replicationManager.canReplicate() || !replicationManager.isMaster()) {
            this.exposeServices(overrides);
        } else {
            replicationManager.replicate();
        }
    }

    private exposeServices(overrides?: any) {
        let registry = this.container.get<IProjectionRegistry>("IProjectionRegistry"),
            clientRegistry = this.container.get<IClientRegistry>("IClientRegistry"),
            pushNotifier = this.container.get<IPushNotifier>("IPushNotifier"),
            config = this.container.get<IEndpointConfig>("IEndpointConfig"),
            socketFactory = this.container.get<ISocketFactory>("ISocketFactory"),
            logger = this.container.get<ILogger>("ILogger"),
            socketConfig = this.container.get<ISocketConfig>("ISocketConfig"),
            requestAdapter = this.container.get<IRequestAdapter>("IRequestAdapter"),
            requestParser = this.container.get<IRequestParser>("IRequestParser");

        _.forEach(this.modules, (module: IModule) => module.register(registry, this.container, overrides));

        app.all("*", (request, response) => {
            requestParser.parse(request, response).then(requestData => requestAdapter.route(requestData[0], requestData[1]));
        });

        PortDiscovery.freePort(config.port).then(port => {
            server.listen(port, error => {
                if (error)
                    logger.error(error);
                else
                    logger.info(`Server listening on ${port}`);
            });
        });

        socketFactory.socketForPath(socketConfig.path).on('connection', client => {
            let wrappedClient = new SocketClient(client);
            client.on('subscribe', message => {
                let context = new PushContext(message.area, message.viewmodelId, message.parameters);
                clientRegistry.add(wrappedClient, context);
                pushNotifier.notify(context, client.id);
                logger.info(`Client subscribed on ${context} with id ${client.id}`);
            });
            client.on('unsubscribe', message => {
                let context = new PushContext(message.area, message.viewmodelId, message.parameters);
                clientRegistry.remove(wrappedClient, context);
                logger.info(`Client unsubscribed from ${context} with id ${client.id}`);
            });
        });
    }

    run(overrides?: any) {
        this.boot(overrides);
        let replicationManager = this.container.get<IReplicationManager>("IReplicationManager");
        if (!replicationManager.canReplicate() || !replicationManager.isMaster())
            this.container.get<IProjectionEngine>("IProjectionEngine").run();
    }
}

export default Engine;
