import IProjectionRegistry from "./IProjectionRegistry";
import AreaRegistry from "./AreaRegistry";
import RegistryEntry from "./RegistryEntry";
import * as _ from "lodash";
import IProjectionDefinition from "./IProjectionDefinition";
import IProjectionRunnerFactory from "../projections/IProjectionRunnerFactory";
import IPushNotifier from "../push/IPushNotifier";
import Constants from "../Constants";
import PushContext from "../push/PushContext";
import {injectable, inject} from "inversify";
import {ProjectionAnalyzer} from "../projections/ProjectionAnalyzer";

@injectable()
class ProjectionRegistry implements IProjectionRegistry {

    private unregisteredEntries:RegistryEntry<any>[] = [];

    constructor(@inject("IProjectionRunnerFactory") private runnerFactory:IProjectionRunnerFactory,
                @inject("IPushNotifier") private pushNotifier:IPushNotifier,
                @inject("ProjectionAnalyzer") private analyzer:ProjectionAnalyzer) {

    }

    master<T>(projection:IProjectionDefinition<T>):AreaRegistry {
        return this.add(projection).forArea(Constants.MASTER_AREA);
    }

    index<T>(projection:IProjectionDefinition<T>):AreaRegistry {
        return this.add(projection).forArea(Constants.INDEX_AREA);
    }

    add<T>(definition:IProjectionDefinition<T>, parameters?:any):IProjectionRegistry {
        let name = Reflect.getMetadata("prettygoat:projection", definition.constructor);
        if (!name)
            throw new Error("Missing Projection decorator");
        let projection = definition.define();
        let validationErrors = this.analyzer.analyze(projection);
        if (validationErrors.length > 0)
            throw new Error(validationErrors[0]);
        this.unregisteredEntries.push(new RegistryEntry<T>(projection, name, parameters));
        return this;
    }

    forArea(area:string):AreaRegistry {
        let areaRegistry = new AreaRegistry(area, this.unregisteredEntries);
        this.unregisteredEntries = [];
        _.forEach<RegistryEntry<any>>(areaRegistry.entries, (entry:RegistryEntry<any>) => {
            this.pushNotifier.register(this.runnerFactory.create(entry.projection), new PushContext(areaRegistry.area, entry.name));
        });
        return areaRegistry;
    }
}

export default ProjectionRegistry