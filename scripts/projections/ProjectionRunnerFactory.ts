import IProjectionRunnerFactory from "./IProjectionRunnerFactory";
import IProjectionRunner from "./IProjectionRunner";
import {ProjectionRunner} from "./ProjectionRunner";
import {Matcher} from "../matcher/Matcher";
import {injectable, inject} from "inversify";
import {IProjection} from "./IProjection";
import {ISnapshotRepository} from "../streams/ISnapshotRepository";
import {IStreamFactory} from "../streams/IStreamFactory";

@injectable()
class ProjectionRunnerFactory implements IProjectionRunnerFactory {

    constructor(@inject("ISnapshotRepository") private snapshotRespository:ISnapshotRepository,
                @inject("IStreamFactory") private streamFactory:IStreamFactory) {
        
    }

    create<T>(projection:IProjection<T>):IProjectionRunner<T> {
        return new ProjectionRunner<T>(projection.name, this.streamFactory, this.snapshotRespository, new Matcher(projection.definition));
    }

}

export default ProjectionRunnerFactory