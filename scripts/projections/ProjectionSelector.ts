import IProjectionSelector from "./IProjectionSelector";
import IProjectionRunner from "./IProjectionRunner";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import IProjectionRunnerFactory from "./IProjectionRunnerFactory";
import Event from "../streams/Event";
import IPushNotifier from "../push/IPushNotifier";
import {inject, injectable} from "inversify";
import * as _ from "lodash";
import AreaRegistry from "../registry/AreaRegistry";
import RegistryEntry from "../registry/RegistryEntry";
import PushContext from "../push/PushContext";
import Dictionary from "../Dictionary";

@injectable()
class ProjectionSelector implements IProjectionSelector {

    private runners:Dictionary<{ splitKey?:string, runner:IProjectionRunner<any> }> = {};

    constructor(@inject("IProjectionRegistry") private registry:IProjectionRegistry,
                @inject("IProjectionRunnerFactory") private runnerFactory:IProjectionRunnerFactory,
                @inject("IPushNotifier") private pushNotifier:IPushNotifier) {

    }

    initialize():void {
        let areas = this.registry.getAreas();
        _.forEach<AreaRegistry>(areas, areaRegistry => {
            _.forEach<RegistryEntry<any>>(areaRegistry.entries, (entry:RegistryEntry<any>) => {
                let runner = this.runnerFactory.create(entry.projection);
                this.pushNotifier.register(runner, new PushContext(areaRegistry.area, entry.name), entry.parametersKey);
                runner.run();
            });
        });
    }

    projectionsFor(event:Event):IProjectionRunner<any>[] {
        return null;
    }

    projectionFor(area:string, projectionName:string, splitKey:string):IProjectionRunner<any> {
        return null;
    }
}

export default ProjectionSelector