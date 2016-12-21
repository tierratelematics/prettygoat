import {ProjectionRunner} from "../../scripts/projections/ProjectionRunner";
import IDateRetriever from "../../scripts/util/IDateRetriever";
import {IStreamFactory} from "../../scripts/streams/IStreamFactory";
import IReadModelFactory from "../../scripts/streams/IReadModelFactory";
import {IMatcher} from "../../scripts/matcher/IMatcher";
import {IProjection} from "../../scripts/projections/IProjection";

export default class PublishProjectionRunner<T> extends ProjectionRunner<T> {

    constructor(protected projection: IProjection<T>, protected stream: IStreamFactory, protected matcher: IMatcher, protected readModelFactory: IReadModelFactory,
                protected tickScheduler: IStreamFactory, protected dateRetriever: IDateRetriever) {
        super(projection, stream, matcher, readModelFactory, tickScheduler, dateRetriever);
    }


    protected subscribeToStateChanges() {

    }
}

