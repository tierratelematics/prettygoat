import IProjectionRunnerFactory from "./IProjectionRunnerFactory";
import {injectable, inject} from "inversify";
import {IProjection} from "./IProjection";
import Dictionary from "../common/Dictionary";
import {IProjectionRunner} from "./IProjectionRunner";
import {Matcher} from "./Matcher";
import {ProjectionRunner} from "./ProjectionRunner";
import {mapValues} from "lodash";
import {IStreamFactory} from "../events/IStreamFactory";

@injectable()
class ProjectionRunnerFactory implements IProjectionRunnerFactory {

    constructor(@inject("IProjectionStreamFactory") private streamFactory: IStreamFactory,
                @inject("IProjectionRunnerHolder") private holder: Dictionary<IProjectionRunner<any>>) {

    }

    create<T>(projection: IProjection<T>): IProjectionRunner<T> {
        let notifyMatchers = mapValues(projection.publish, point => new Matcher(point.notify));
        let projectionRunner = new ProjectionRunner<T>(projection, this.streamFactory, new Matcher(projection.definition), notifyMatchers);
        this.holder[projection.name] = projectionRunner;
        return projectionRunner;
    }

}

export default ProjectionRunnerFactory
