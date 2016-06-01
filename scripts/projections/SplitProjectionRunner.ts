import {ISnapshotRepository, Snapshot} from "../streams/ISnapshotRepository";
import {SpecialNames} from "../matcher/SpecialNames";
import {IMatcher} from "../matcher/IMatcher";
import {IStreamFactory} from "../streams/IStreamFactory";
import * as Rx from "rx";
import {ProjectionRunner} from "./ProjectionRunner";

export class SplitProjectionRunner<T> extends ProjectionRunner<T> {

    constructor(streamId:string, stream:IStreamFactory, repository:ISnapshotRepository,
                definitionMatcher:IMatcher, private splitMatcher:IMatcher) {
        super(streamId, stream, repository, definitionMatcher);
    }

    run():void {
        if (this.isDisposed)
            throw new Error(`${this.streamId}: cannot run a disposed projection`);

        if (this.subscription !== undefined)
            return;

        let snapshot = this.repository.getSnapshot<T>(this.streamId);
        if (snapshot !== Snapshot.Empty)
            this.state = snapshot.memento;
        else
            this.state = this.matcher.match(SpecialNames.Init)();
        this.subject.onNext(this.state);

        this.subscription = this.stream.from(snapshot.lastEvent).subscribe((event:any) => {
            try {
                let matchFunction = this.matcher.match(event.type);
                if (matchFunction !== Rx.helpers.identity) {
                    this.state = matchFunction(this.state, event.payload);
                    this.subject.onNext(this.state);
                }
            } catch (error) {
                this.isFailed = true;
                this.subject.onError(error);
                this.stop();
            }
        });
    }
}


