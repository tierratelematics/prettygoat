import IProjectionRunnerFactory from "./IProjectionRunnerFactory";
import IProjectionRunner from "./IProjectionRunner";
import {ProjectionRunner} from "./ProjectionRunner";
import {Matcher} from "../Matcher";
import {injectable} from "inversify";
import {IProjection} from "./IProjection";

@injectable()
class ProjectionRunnerFactory implements IProjectionRunnerFactory {

    create<T>(projection:IProjection<T>):IProjectionRunner<T> {
        return new ProjectionRunner<T>(projection.name, null, null, new Matcher(projection.definition));
    }

}

export default ProjectionRunnerFactory