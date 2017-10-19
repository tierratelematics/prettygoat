import IProjectionRunnerFactory from "./IProjectionRunnerFactory";
import {injectable, inject} from "inversify";
import {IProjection} from "./IProjection";
import Dictionary from "../common/Dictionary";
import {IProjectionRunner} from "./IProjectionRunner";
import {Matcher} from "./Matcher";
import {ProjectionRunner} from "./ProjectionRunner";
import {mapValues} from "lodash";
import {IStreamFactory} from "../events/IStreamFactory";
import {IdempotenceFilter, IIdempotenceFilter} from "../events/IdempotenceFilter";
import {NullLogger, ILogger} from "inversify-logging";

@injectable()
class ProjectionRunnerFactory implements IProjectionRunnerFactory {

    constructor(@inject("IProjectionStreamFactory") private streamFactory: IStreamFactory,
                @inject("IProjectionRunnerHolder") private runnerHolder: Dictionary<IProjectionRunner<any>>,
                @inject("IdempotenceFilterHolder") private filterHolder: Dictionary<IIdempotenceFilter>,
                @inject("ILogger") private logger: ILogger = NullLogger) {
        this.logger = this.logger.createChildLogger("ProjectionRunner");
    }

    create<T>(projection: IProjection<T>): IProjectionRunner<T> {
        let notifyMatchers = mapValues(projection.publish, point => new Matcher(point.notify));
        let idempotenceFilter = new IdempotenceFilter();
        let projectionRunner = new ProjectionRunner<T>(projection, this.streamFactory, new Matcher(projection.definition),
            notifyMatchers, idempotenceFilter, this.logger.createChildLogger(projection.name));
        this.runnerHolder[projection.name] = projectionRunner;
        this.filterHolder[projection.name] = idempotenceFilter;
        return projectionRunner;
    }

}

export default ProjectionRunnerFactory
