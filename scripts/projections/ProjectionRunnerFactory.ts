import IProjectionRunnerFactory from "./IProjectionRunnerFactory";
import ProjectionRunner from "./ProjectionRunner";
import {injectable, inject} from "inversify";
import {IProjection} from "./IProjection";
import Dictionary from "../util/Dictionary";
import {IProjectionStreamGenerator} from "./ProjectionStreamGenerator";
import {IProjectionRunner} from "./IProjectionRunner";
import {Matcher} from "./Matcher";

@injectable()
class ProjectionRunnerFactory implements IProjectionRunnerFactory {

    constructor(@inject("IProjectionStreamGenerator") private streamGenerator: IProjectionStreamGenerator,
                @inject("IProjectionRunnerHolder") private holder: Dictionary<IProjectionRunner<any>>) {

    }

    create<T>(projection: IProjection<T>): IProjectionRunner<T> {
        let projectionRunner = new ProjectionRunner<T>(projection, this.streamGenerator, new Matcher(projection.definition));
        this.holder[projection.name] = projectionRunner;
        return projectionRunner;
    }

}

export default ProjectionRunnerFactory
