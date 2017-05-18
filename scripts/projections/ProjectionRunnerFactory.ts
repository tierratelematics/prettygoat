import IProjectionRunnerFactory from "./IProjectionRunnerFactory";
import IProjectionRunner from "./IProjectionRunner";
import ProjectionRunner from "./ProjectionRunner";
import {injectable, inject} from "inversify";
import {IProjection} from "./IProjection";
import {IStreamFactory} from "../streams/IStreamFactory";
import {Matcher} from "../matcher/Matcher";
import IReadModelFactory from "../streams/IReadModelFactory";
import SplitProjectionRunner from "./SplitProjectionRunner";
import {MemoizingMatcher} from "../matcher/MemoizingMatcher";
import Dictionary from "../util/Dictionary";
import ITickScheduler from "../ticks/ITickScheduler";
import IDateRetriever from "../util/IDateRetriever";
import {Observable} from "rx";

@injectable()
class ProjectionRunnerFactory implements IProjectionRunnerFactory {

    constructor(@inject("IStreamFactory") private streamFactory: IStreamFactory,
                @inject("IReadModelFactory") private readModelFactory: IReadModelFactory,
                @inject("IProjectionRunnerHolder") private holder: Dictionary<IProjectionRunner<any>>,
                @inject("ITickSchedulerHolder") private tickSchedulerHolder: Dictionary<ITickScheduler>,
                @inject("IDateRetriever") private dateRetriever: IDateRetriever,
                @inject("RealtimeNotifier") private realtimeNotifier: Observable<string>) {

    }

    create<T>(projection: IProjection<T>): IProjectionRunner<T> {
        let definitionMatcher = new MemoizingMatcher(new Matcher(projection.definition));
        let projectionRunner: IProjectionRunner<T>;
        if (!projection.split)
            projectionRunner = new ProjectionRunner<T>(projection, this.streamFactory, definitionMatcher, this.readModelFactory,
                this.tickSchedulerHolder[projection.name], this.dateRetriever, this.realtimeNotifier);
        else
            projectionRunner = new SplitProjectionRunner<T>(projection, this.streamFactory, definitionMatcher,
                new MemoizingMatcher(new Matcher(projection.split)), this.readModelFactory, this.tickSchedulerHolder[projection.name],
                this.dateRetriever, this.realtimeNotifier);
        this.holder[projection.name] = projectionRunner;
        return projectionRunner;
    }

}

export default ProjectionRunnerFactory