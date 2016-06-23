import IProjectionRunnerFactory from "./IProjectionRunnerFactory";
import IProjectionRunner from "./IProjectionRunner";
import {ProjectionRunner} from "./ProjectionRunner";
import {injectable, inject} from "inversify";
import {IProjection} from "./IProjection";
import {ISnapshotRepository} from "../snapshots/ISnapshotRepository";
import {IStreamFactory} from "../streams/IStreamFactory";
import {SplitProjectionRunner} from "./SplitProjectionRunner";
import {Matcher} from "../matcher/Matcher";
import IReadModelFactory from "../streams/IReadModelFactory";

@injectable()
class ProjectionRunnerFactory implements IProjectionRunnerFactory {

    constructor(@inject("ISnapshotRepository") private snapshotRespository:ISnapshotRepository,
                @inject("IStreamFactory") private streamFactory:IStreamFactory,
                @inject("IReadModelFactory") private aggregateFactory:IReadModelFactory) {

    }

    create<T>(projection:IProjection<T>):IProjectionRunner<T> {
        return new ProjectionRunner<T>(projection, this.streamFactory, this.snapshotRespository,
            new Matcher(projection.definition), this.aggregateFactory);
    }
}

export default ProjectionRunnerFactory