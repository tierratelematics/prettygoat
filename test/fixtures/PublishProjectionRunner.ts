import ProjectionRunner from "../../scripts/projections/ProjectionRunner";
import IReadModelFactory from "../../scripts/streams/IReadModelFactory";
import {IMatcher} from "../../scripts/matcher/IMatcher";
import {IProjection} from "../../scripts/projections/IProjection";
import {Subject} from "rx";
import {IProjectionStreamGenerator} from "../../scripts/projections/ProjectionStreamGenerator";

export default class PublishProjectionRunner<T> extends ProjectionRunner<T> {

    constructor(protected projection: IProjection<T>, protected stream: IProjectionStreamGenerator, protected matcher: IMatcher,
                protected readModelFactory: IReadModelFactory, protected realtimeNotifier: Subject<string>) {
        super(projection, stream, matcher, readModelFactory, realtimeNotifier);
    }


    protected subscribeToStateChanges() {

    }
}
