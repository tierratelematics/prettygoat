import IProjectionRegistry from "./IProjectionRegistry";
import AreaRegistry from "./AreaRegistry";
import RegistryEntry from "./RegistryEntry";
import * as _ from "lodash";
import IProjectionDefinition from "./IProjectionDefinition";
import IProjectionRunnerFactory from "../projections/IProjectionRunnerFactory";
import IPushNotifier from "../push/IPushNotifier";
import Constants from "../Constants";
import PushContext from "../push/PushContext";

class ProjectionRegistry implements IProjectionRegistry {

    private unregisteredEntries:RegistryEntry<any>[] = [];

    constructor(private runnerFactory:IProjectionRunnerFactory, private pushNotifier:IPushNotifier) {

    }

    master<T>(projection:IProjectionDefinition<T>):AreaRegistry {
        return this.add(projection).forArea(Constants.MASTER_AREA);
    }

    index<T>(projection:IProjectionDefinition<T>):AreaRegistry {
        return this.add(projection).forArea(Constants.INDEX_AREA);
    }

    add<T>(projection:IProjectionDefinition<T>, parameters?:any):IProjectionRegistry {
        let name = Reflect.getMetadata("prettygoat:projection", projection.constructor);
        if (!name)
            throw new Error("Missing Projection decorator");
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