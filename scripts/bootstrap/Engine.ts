import "bluebird";
import "reflect-metadata";
import {Kernel} from "inversify";
import IModule from "./IModule";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import * as _ from "lodash";
import PrettyGoatModule from "./PrettyGoatModule";
import {server, socket} from "./Socket";
import IProjectionEngine from "../projections/IProjectionEngine";
import IClientRegistry from "../push/IClientRegistry";

class Engine {

    private kernel = new Kernel();
    private modules:IModule[] = [];

    constructor() {
        this.register(new PrettyGoatModule());
    }

    register(module:IModule) {
        this.kernel.load(module.modules);
        this.modules.push(module);
    }

    run(overrides?:any) {
        let registry = this.kernel.get<IProjectionRegistry>("IProjectionRegistry"),
            projectionEngine = this.kernel.get<IProjectionEngine>("IProjectionEngine"),
            clientRegistry = this.kernel.get<IClientRegistry>("IClientRegistry");
        _.forEach(this.modules, (module:IModule) => module.register(registry, this.kernel, overrides));
        server.listen(3000);
        socket.on('connection', client => {
            client.on('subscribe', message => clientRegistry.add(client.id, message));
            client.on('unsubscribe', message => clientRegistry.remove(client.id, message));
        });
        projectionEngine.run();
    }
}

export default Engine;
