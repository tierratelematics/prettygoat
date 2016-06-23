import IProjectionRunnerFactory from "./IProjectionRunnerFactory";
import IProjectionRunner from "./IProjectionRunner";
import {ProjectionRunner} from "./ProjectionRunner";
import {injectable, inject} from "inversify";
import {IWhen} from "./IProjection";
import {Matcher} from "../matcher/Matcher";
import IReadModelFactory from "../streams/IReadModelFactory";

@injectable()
class ProjectionRunnerFactory implements IProjectionRunnerFactory {

    constructor(@inject("IReadModelFactory") private readModelFactory:IReadModelFactory) {

    }

    create<T>(projectionName:string, definition:IWhen<T>):IProjectionRunner<T> {
        return new ProjectionRunner<T>(projectionName, new Matcher(definition), this.readModelFactory);
    }
}

export default ProjectionRunnerFactory