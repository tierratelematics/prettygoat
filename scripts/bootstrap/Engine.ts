import "bluebird";
import "reflect-metadata";
import {Kernel} from "inversify";
import IModule from "./IModule";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import * as _ from "lodash";
import PrettyGoatModule from "./PrettyGoatModule";
import {server} from "./Socket";

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
        let registry = this.kernel.get<IProjectionRegistry>("IProjectionRegistry");
        _.forEach(this.modules, (module:IModule) => module.register(registry, this.kernel, overrides));
        server.listen(3000);
        //TODO: run projections
    }
}

export default Engine;
