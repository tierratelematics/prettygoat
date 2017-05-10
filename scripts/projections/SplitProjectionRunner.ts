import {IMatcher} from "../matcher/IMatcher";
import {IStreamFactory} from "../streams/IStreamFactory";
import {Observable, Subject} from "rx";
import IReadModelFactory from "../streams/IReadModelFactory";
import {Event} from "../streams/Event";
import * as _ from "lodash";
import {SpecialNames} from "../matcher/SpecialNames";
import Dictionary from "../util/Dictionary";
import {Snapshot} from "../snapshots/ISnapshotRepository";
import {combineStreams} from "./ProjectionStream";
import IDateRetriever from "../util/IDateRetriever";
import {IProjection, SplitKey} from "./IProjection";
import {SpecialState, StopSignallingState, DeleteSplitState} from "./SpecialState";
import ProjectionRunner from "./ProjectionRunner";
import ReservedEvents from "../streams/ReservedEvents";
import Identity from "../matcher/Identity";
import {ValueOrPromise, isPromise, toArray, ObservableOrPromise} from "../util/TypesUtil";
import {flatMapSeries} from "../util/RxOperators";

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
        this.startStream(snapshot);
    }

    startStream(snapshot?: Snapshot<T | Dictionary<T>>) {
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
            .filter(data => data[1] !== Identity)
            .do(data => this.updateStats(data[0]))
            .let<any>(flatMapSeries<any, any>(data => this.calculateSplitKeys(data[0], data[1], data[2])))
            .let<any>(flatMapSeries<any, any>(data => this.calculateStates(data[0], data[1], data[2])))
            .subscribe(data => {
                let [event, splitKeys] = data;
                _.forEach(splitKeys, key => this.notifyStateChange(event.timestamp, key));
            }, error => {
                this.isFailed = true;
                this.subject.onError(error);
                this.stop();
            }, () => this.subject.onCompleted());

        combineStreams(
            combinedStream,
            this.stream.from(snapshot ? snapshot.lastEvent : null, completions, this.projection.definition)
                .filter(event => event.type !== this.streamId),
            this.readModelFactory.from(null).filter(event => event.type !== this.streamId),
            this.tickScheduler.from(null),
            this.dateRetriever);
    }

    private calculateSplitKeys(event: Event, matchFn: Function, splitFn: Function): ObservableOrPromise<any> {
        let splitKeys = this.splitKeysForEvent(event, splitFn);
        if (isPromise(splitKeys)) {
            return (<Promise<SplitKey>>splitKeys).then(keys => [event, matchFn, keys]);
        } else {
            return Observable.just([event, matchFn, splitKeys]);
        }
    }

    private splitKeysForEvent(event: Event, splitFn: Function): ValueOrPromise<SplitKey> {
        if (splitFn === Identity)
            return this.allSplitKeys();
        let splitKey = splitFn(event.payload, event);
        return isPromise(splitKey) ? splitKey.then(key => event.splitKey = key) : event.splitKey = splitKey;
    }

    private calculateStates(event: Event, matchFn: Function, splitKeys: SplitKey): ObservableOrPromise<any> {
        let keysArray = toArray<string>(splitKeys);
        _.forEach(keysArray, key => {
            if (_.isUndefined(this.state[key]))
                this.initSplit(key);
        });
        let states = this.dispatchEvent(matchFn, event, keysArray);
        if (isPromise(states[0]))
            return Promise.all(states).then(() => [event, keysArray]);
        else
            return Observable.just([event, keysArray]);
    }

    private initSplit(splitKey: string) {
        this.state[splitKey] = this.matcher.match(SpecialNames.Init)();
        _.forEach(this.readModelFactory.asList(), readModel => {
            let matchFn = this.matcher.match(readModel.type);
            if (matchFn !== Identity)
                this.state[splitKey] = matchFn(this.state[splitKey], readModel.payload, readModel);
        });
    }

    private dispatchEvent(matchFn: Function, event: Event, splits: string[]): ValueOrPromise<T>[] {
        return _.map(splits, key => {
            let state = matchFn(this.state[key], event.payload, event);
            return isPromise(state) ? state.then(newState => this.state[key] = newState) : this.state[key] = state;
        });
    }

    private allSplitKeys(): string[] {
        return _.keys(this.state);
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
