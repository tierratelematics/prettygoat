import IProjectionRunnerFactory from "./IProjectionRunnerFactory";
import IProjectionRunner from "./IProjectionRunner";
import ProjectionRunner from "./ProjectionRunner";
import {injectable, inject} from "inversify";
import {IProjection} from "./IProjection";
import {Matcher} from "../matcher/Matcher";
import IReadModelFactory from "../streams/IReadModelFactory";
import SplitProjectionRunner from "./SplitProjectionRunner";
import {MemoizingMatcher} from "../matcher/MemoizingMatcher";
import Dictionary from "../util/Dictionary";
import {ISubject} from "rx";
import {IProjectionStreamGenerator} from "./ProjectionStreamGenerator";

@injectable()
class ProjectionRunnerFactory implements IProjectionRunnerFactory {

    constructor(@inject("IProjectionStreamGenerator") private streamGenerator: IProjectionStreamGenerator,
                @inject("IReadModelFactory") private readModelFactory: IReadModelFactory,
                @inject("IProjectionRunnerHolder") private holder: Dictionary<IProjectionRunner<any>>,
                @inject("RealtimeNotifier") private realtimeNotifier: ISubject<string>) {

    }

    create<T>(projection: IProjection<T>): IProjectionRunner<T> {
        let definitionMatcher = new MemoizingMatcher(new Matcher(projection.definition));
        let projectionRunner: IProjectionRunner<T>;
        if (!projection.split)
            projectionRunner = new ProjectionRunner<T>(projection, this.streamGenerator, definitionMatcher, this.readModelFactory, this.realtimeNotifier);
        else
            projectionRunner = new SplitProjectionRunner<T>(projection, this.streamGenerator, definitionMatcher,
                new MemoizingMatcher(new Matcher(projection.split)), this.readModelFactory, this.realtimeNotifier);
        this.holder[projection.name] = projectionRunner;
        return projectionRunner;
    }

}

export default ProjectionRunnerFactory