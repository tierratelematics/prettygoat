import IProjectionEngine from "./IProjectionEngine";
import IPushNotifier from "../push/IPushNotifier";
import {injectable, inject} from "inversify";
import IProjectionRunnerFactory from "./IProjectionRunnerFactory";
import IProjectionRegistry from "../registry/IProjectionRegistry";

@injectable()
class ProjectionEngine implements IProjectionEngine {

    constructor(@inject("IProjectionRunnerFactory") private runnerFactory:IProjectionRunnerFactory,
                @inject("IPushNotifier") private pushNotifier:IPushNotifier,
                @inject("IProjectionRegistry") private registry:IProjectionRegistry) {

    }

    run():void {
    }

}

/*
 _.forEach<RegistryEntry<any>>(areaRegistry.entries, (entry:RegistryEntry<any>) => {
 this.pushNotifier.register(this.runnerFactory.create(entry.projection), new PushContext(areaRegistry.area, entry.name));
 });
 */

export default ProjectionEngine