import IProjectionRunnerFactory from "./IProjectionRunnerFactory";
import IProjectionRunner from "./IProjectionRunner";
import {ProjectionRunner} from "./ProjectionRunner";
import {injectable, inject} from "inversify";
import {IProjection} from "./IProjection";
import {IStreamFactory} from "../streams/IStreamFactory";
import {Matcher} from "../matcher/Matcher";
import IReadModelFactory from "../streams/IReadModelFactory";
import SplitProjectionRunner from "./SplitProjectionRunner";
import {MemoizingMatcher} from "../matcher/MemoizingMatcher";

@injectable()
class ProjectionRunnerFactory implements IProjectionRunnerFactory {

    constructor(@inject("IStreamFactory") private streamFactory:IStreamFactory,
                @inject("IReadModelFactory") private aggregateFactory:IReadModelFactory) {

    }

    create<T>(projection:IProjection<T>):IProjectionRunner<T> {
        let definitionMatcher = new MemoizingMatcher(new Matcher(projection.definition));
        if (!projection.split)
            return new ProjectionRunner<T>(projection.name, this.streamFactory, definitionMatcher, this.aggregateFactory);
        else
            return new SplitProjectionRunner<T>(projection.name, this.streamFactory, definitionMatcher,
                new MemoizingMatcher(new Matcher(projection.split)), this.aggregateFactory);
    }

}

export default ProjectionRunnerFactory