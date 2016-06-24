import IProjectionEngine from "./IProjectionEngine";
import IPushNotifier from "../push/IPushNotifier";
import {injectable, inject} from "inversify";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import * as _ from "lodash";
import AreaRegistry from "../registry/AreaRegistry";
import {IStreamFactory} from "../streams/IStreamFactory";
import IReadModelFactory from "../streams/IReadModelFactory";
import IProjectionSelector from "./IProjectionSelector";
import PushContext from "../push/PushContext";

@injectable()
class ProjectionEngine implements IProjectionEngine {

    constructor(@inject("IPushNotifier") private pushNotifier:IPushNotifier,
                @inject("IProjectionRegistry") private registry:IProjectionRegistry,
                @inject("IStreamFactory") private streamFactory:IStreamFactory,
                @inject("IReadModelFactory") private readModelFactory:IReadModelFactory,
                @inject("IProjectionSelector") private projectionSelector:IProjectionSelector) {

    }

    run():void {
        let areas = this.registry.getAreas();
        _.forEach<AreaRegistry>(areas, areaRegistry => {
            let projections = this.projectionSelector.addProjections(areaRegistry);
            _.forEach(projections, (projection, index) => {
                let entry = areaRegistry.entries[index];
                this.pushNotifier.register(projection, new PushContext(areaRegistry.area, entry.name), entry.parametersKey);
            });
        });
        this.streamFactory.from(null).merge(this.readModelFactory.from(null)).subscribe(event => {
            let projections = this.projectionSelector.projectionsFor(event);
            _.invokeMap(projections, 'handle', event);
        });
    }

}

export default ProjectionEngine