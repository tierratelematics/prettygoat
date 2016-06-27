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
            let projections = this.projectionSelector.projectionsFor(event);
            _.invokeMap(projections, 'handle', event);
        });
        this.statePublisher.publish();
    }

}

export default ProjectionEngine