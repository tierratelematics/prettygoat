import {IMatcher} from "../matcher/IMatcher";
import {IStreamFactory} from "../streams/IStreamFactory";
import {helpers, Subject} from "rx";
import IReadModelFactory from "../streams/IReadModelFactory";
import {Event} from "../streams/Event";
import * as _ from "lodash";
import {SpecialNames} from "../matcher/SpecialNames";
import Dictionary from "../util/Dictionary";
import {Snapshot} from "../snapshots/ISnapshotRepository";
import {combineStreams} from "./ProjectionStream";
import IDateRetriever from "../util/IDateRetriever";
import {IProjection} from "./IProjection";
import {SpecialState, StopSignallingState, DeleteSplitState} from "./SpecialState";
import ProjectionRunner from "./ProjectionRunner";
import ReservedEvents from "../streams/ReservedEvents";

class SplitProjectionRunner<T> extends ProjectionRunner<T> {
    state: Dictionary<T> = {};

    constructor(projection: IProjection<T>, stream: IStreamFactory, matcher: IMatcher,
                private splitMatcher: IMatcher, readModelFactory: IReadModelFactory, tickScheduler: IStreamFactory,
                dateRetriever: IDateRetriever) {
        super(projection, stream, matcher, readModelFactory, tickScheduler, dateRetriever);
    }

    run(snapshot?: Snapshot<T|Dictionary<T>>): void {
        if (this.isDisposed)
            throw new Error(`${this.streamId}: cannot run a disposed projection`);

        if (this.subscription !== undefined)
            return;

        this.stats.running = true;
        this.state = snapshot ? <Dictionary<T>>snapshot.memento : {};
        let combinedStream = new Subject<Event>();
        let completions = new Subject<string>();

        this.subscription = combinedStream
            .map<[Event, Function, Function]>(event => [
                event,
                this.matcher.match(event.type),
                this.splitMatcher.match(event.type)
            ])
            .do(data => {
                if (data[0].type === ReservedEvents.FETCH_EVENTS)
                    completions.onNext(data[0].payload.event);
            })
            .filter(data => data[1] !== helpers.identity)
            .do(data => this.updateStats(data[0]))
            .subscribe(data => {
                let [event, matchFn, splitFn] = data;
                try {
                    if (splitFn !== helpers.identity) {
                        let splitKey = splitFn(event.payload, event);
                        event.splitKey = splitKey;
                        let childState = this.state[splitKey];
                        if (_.isUndefined(childState))
                            this.initSplit(matchFn, event, splitKey);
                        else
                            this.state[splitKey] = matchFn(childState, event.payload, event);
                        this.notifyStateChange(event.timestamp, splitKey);
                    } else {
                        this.dispatchEventToAll(matchFn, event);
                    }
                } catch (error) {
                    this.isFailed = true;
                    this.subject.onError(error);
                    this.stop();
                }
            });

        combineStreams(
            combinedStream,
            this.stream.from(snapshot ? snapshot.lastEvent : null, completions, this.projection.definition)
                .filter(event => event.type !== this.streamId),
            this.readModelFactory.from(null).filter(event => event.type !== this.streamId),
            this.tickScheduler.from(null),
            this.dateRetriever);
    }

    private initSplit(matchFn: Function, event, splitKey: string) {
        this.state[splitKey] = this.matcher.match(SpecialNames.Init)();
        _.forEach(this.readModelFactory.asList(), readModel => {
            let matchFn = this.matcher.match(readModel.type);
            if (matchFn !== helpers.identity) {
                this.state[splitKey] = matchFn(this.state[splitKey], readModel.payload, readModel);
                this.notifyStateChange(event.timestamp, splitKey);
            }
        });
        this.state[splitKey] = matchFn(this.state[splitKey], event.payload, event);
    }

    private dispatchEventToAll(matchFn: Function, event) {
        _.forEach(this.state, (state, key) => {
            if (this.state[key]) {
                this.state[key] = matchFn(state, event.payload, event);
                this.notifyStateChange(event.timestamp, key);
            }
        });
    }

    protected notifyStateChange(timestamp: Date, splitKey: string) {
        let newState = this.state[splitKey];
        if (newState instanceof SpecialState)
            this.state[splitKey] = (<any>newState).state;
        if (newState instanceof DeleteSplitState)
            delete this.state[splitKey];
        if (!(newState instanceof StopSignallingState))
            this.subject.onNext({
                type: this.streamId,
                payload: this.state[splitKey],
                timestamp: timestamp,
                splitKey: splitKey
            });
    }
}

export default SplitProjectionRunner
