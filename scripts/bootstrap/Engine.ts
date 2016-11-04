import "bluebird";
import "reflect-metadata";
import {Kernel} from "inversify";
import IModule from "./IModule";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import * as _ from "lodash";
import PrettyGoatModule from "./PrettyGoatModule";
import IProjectionEngine from "../projections/IProjectionEngine";
import IClientRegistry from "../push/IClientRegistry";
import IPushNotifier from "../push/IPushNotifier";
import IEndpointConfig from "../configs/IEndpointConfig";
import {server} from "./Server";
import SocketFactory from "../push/SocketFactory";
import ILogger from "../log/ILogger";
import {FeatureChecker} from "bivio";
import {IFeatureChecker} from "bivio";

class Engine {

    private kernel = new Kernel();
    private modules:IModule[] = [];
    private featureChecker = new FeatureChecker();

    constructor() {
        this.register(new PrettyGoatModule());
        this.kernel.bind<IFeatureChecker>("IFeatureChecker").toConstantValue(this.featureChecker);
    }

    register(module:IModule):boolean {
        if (!this.featureChecker.canCheck(module.constructor) || this.featureChecker.check(module.constructor)) {
            if (module.modules)
                module.modules(this.kernel);
            this.modules.push(module);
            return true;
        }
        return false;
    }

    run(overrides?:any) {
        let registry = this.kernel.get<IProjectionRegistry>("IProjectionRegistry"),
            projectionEngine = this.kernel.get<IProjectionEngine>("IProjectionEngine"),
            clientRegistry = this.kernel.get<IClientRegistry>("IClientRegistry"),
            pushNotifier = this.kernel.get<IPushNotifier>("IPushNotifier"),
            config = this.kernel.get<IEndpointConfig>("IEndpointConfig"),
            socketFactory = this.kernel.get<SocketFactory>("SocketFactory"),
            logger = this.kernel.get<ILogger>("ILogger");
        _.forEach(this.modules, (module:IModule) => module.register(registry, this.kernel, overrides));
        server.listen(config.port || 80);
        logger.info(`Server listening on ${config.port || 80}`);
        socketFactory.socketForPath().on('connection', client => {
            client.on('subscribe', context => {
                clientRegistry.add(client.id, context);
                pushNotifier.notify(context, client.id);
                logger.info(`New client subscribed on ${context} with id ${client.id}`);
            });
            client.on('unsubscribe', message => {
                clientRegistry.remove(client.id, message);
                logger.info(`New client unsubscribed from ${message} with id ${client.id}`);
            });
        });
        projectionEngine.run();
    }
}

export default Engine;
