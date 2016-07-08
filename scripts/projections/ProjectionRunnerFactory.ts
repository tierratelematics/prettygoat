import IProjectionRunnerFactory from "./IProjectionRunnerFactory";
import IProjectionRunner from "./IProjectionRunner";
import {ProjectionRunner} from "./ProjectionRunner";
import {injectable, inject} from "inversify";
import {IProjection} from "./IProjection";
import {IStreamFactory} from "../streams/IStreamFactory";
import {Matcher} from "../matcher/Matcher";
import IReadModelFactory from "../streams/IReadModelFactory";
import SplitProjectionRunner from "./SplitProjectionRunner";

@injectable()
class ProjectionRunnerFactory implements IProjectionRunnerFactory {

    constructor(@inject("IStreamFactory") private streamFactory:IStreamFactory,
                @inject("IReadModelFactory") private aggregateFactory:IReadModelFactory) {

    }

    create<T>(projection:IProjection<T>):IProjectionRunner<T> {
        if (!projection.split)
            return new ProjectionRunner<T>(projection.name, this.streamFactory,
                new Matcher(projection.definition), this.aggregateFactory);
        else
            return new SplitProjectionRunner<T>(projection.name, this.streamFactory,
                new Matcher(projection.definition), new Matcher(projection.split), this.aggregateFactory);
    }

}

export default ProjectionRunnerFactory