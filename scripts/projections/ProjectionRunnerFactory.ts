import IProjectionRunnerFactory from "./IProjectionRunnerFactory";
import IProjectionDefinition from "../registry/IProjectionDefinition";
import IProjectionRunner from "../interfaces/IProjectionRunner";
import {ProjectionRunner} from "../ProjectionRunner";
import {Matcher} from "../Matcher";

class ProjectionRunnerFactory implements IProjectionRunnerFactory {

    create<T>(definition:IProjectionDefinition<T>):IProjectionRunner<T> {
        let projection = definition.define();
        return new ProjectionRunner<T>(projection.name, null, null, new Matcher(projection.definition));
    }

}

export default ProjectionRunnerFactory