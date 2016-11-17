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
import Dictionary from "../Dictionary";
import ITickScheduler from "../ticks/ITickScheduler";
import IDateRetriever from "../util/IDateRetriever";

@injectable()
class ProjectionRunnerFactory implements IProjectionRunnerFactory {

    constructor(@inject("IStreamFactory") private streamFactory:IStreamFactory,
                @inject("IReadModelFactory") private aggregateFactory:IReadModelFactory,
                @inject("IProjectionRunnerHolder") private holder:Dictionary<IProjectionRunner<any>>,
                @inject("ITickSchedulerHolder") private tickSchedulerHolder:Dictionary<ITickScheduler>,
                @inject("IDateRetriever") private dateRetriever:IDateRetriever) {

    }

    create<T>(projection:IProjection<T>):IProjectionRunner<T> {
        let definitionMatcher = new MemoizingMatcher(new Matcher(projection.definition));
        let projectionRunner:IProjectionRunner<T>;
        if (!projection.split)
            projectionRunner = new ProjectionRunner<T>(projection, this.streamFactory, definitionMatcher, this.aggregateFactory,
                this.tickSchedulerHolder[projection.name], this.dateRetriever);
        else
            projectionRunner = new SplitProjectionRunner<T>(projection, this.streamFactory, definitionMatcher,
                new MemoizingMatcher(new Matcher(projection.split)), this.aggregateFactory, this.tickSchedulerHolder[projection.name],
                this.dateRetriever);
        this.holder[projection.name] = projectionRunner;
        return projectionRunner;
    }

}

export default ProjectionRunnerFactory