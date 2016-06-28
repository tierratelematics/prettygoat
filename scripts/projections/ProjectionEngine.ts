import IProjectionEngine from "./IProjectionEngine";
import IPushNotifier from "../push/IPushNotifier";
import {injectable, inject} from "inversify";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import * as _ from "lodash";
import AreaRegistry from "../registry/AreaRegistry";
import {IStreamFactory} from "../streams/IStreamFactory";
import IReadModelFactory from "../streams/IReadModelFactory";
import IProjectionSelector from "./IProjectionSelector";
import IStatePublisher from "./IStatePublisher";
import PushContext from "../push/PushContext";
import Event from "../streams/Event";

@injectable()
class ProjectionEngine implements IProjectionEngine {

    constructor(@inject("IPushNotifier") private pushNotifier:IPushNotifier,
                @inject("IProjectionRegistry") private registry:IProjectionRegistry,
                @inject("IStreamFactory") private streamFactory:IStreamFactory,
                @inject("IReadModelFactory") private readModelFactory:IReadModelFactory,
                @inject("IProjectionSelector") private projectionSelector:IProjectionSelector,
                @inject("IStatePublisher") private statePublisher:IStatePublisher) {

    }

    run():void {
        let areas = this.registry.getAreas();
        _.forEach<AreaRegistry>(areas, areaRegistry => this.projectionSelector.addProjections(areaRegistry));
        this.streamFactory.from(null).merge(this.readModelFactory.from(null)).subscribe(event => {
            //When a new event is received it can be an event from cassandra or a read model
            //If an entry is retrieved that it means it's a read models and it needs to be notified to the frontend but not processed
            //since I cannot depend on a split projection
            this.notifyReadModel(event);
            if (event.splitKey) return;
            let projections = this.projectionSelector.projectionsFor(event);
            _.invokeMap(projections, 'handle', event);
        });
        this.statePublisher.publish();
    }

    private notifyReadModel(event:Event<any>) {
        let registryEntry = this.registry.getEntry(event.type);
        if (registryEntry && registryEntry.data)
            this.pushNotifier.notify(new PushContext(registryEntry.area, registryEntry.data.name), null, event.splitKey);
    }
}

export default ProjectionEngine