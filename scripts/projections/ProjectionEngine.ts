import IProjectionEngine from "./IProjectionEngine";
import IPushNotifier from "../push/IPushNotifier";
import {injectable, inject} from "inversify";
import IProjectionRunnerFactory from "./IProjectionRunnerFactory";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import * as _ from "lodash";
import AreaRegistry from "../registry/AreaRegistry";
import RegistryEntry from "../registry/RegistryEntry";
import PushContext from "../push/PushContext";
import IStatePublisher from "../routing/IStatePublisher";

@injectable()
class ProjectionEngine implements IProjectionEngine {

    constructor(@inject("IProjectionRunnerFactory") private runnerFactory:IProjectionRunnerFactory,
                @inject("IPushNotifier") private pushNotifier:IPushNotifier,
                @inject("IProjectionRegistry") private registry:IProjectionRegistry,
                @inject("IStatePublisher") private statePublisher:IStatePublisher) {

    }

    run():void {
        let areas = this.registry.getAreas();
        _.forEach<AreaRegistry>(areas, areaRegistry => {
            _.forEach<RegistryEntry<any>>(areaRegistry.entries, (entry:RegistryEntry<any>) => {
                let runner = this.runnerFactory.create(entry.projection),
                    context = new PushContext(areaRegistry.area, entry.name);
                runner.subscribe(state => this.pushNotifier.notify(context, null, state.splitKey));
                this.statePublisher.publish(runner, context);
                runner.run();
            });
        });
    }

}

export default ProjectionEngine