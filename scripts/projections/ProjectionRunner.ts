import {Subject} from "rx";
import {SpecialNames} from "../matcher/SpecialNames";
import {IMatcher} from "../matcher/IMatcher";
import {IStreamFactory} from "../streams/IStreamFactory";
import IProjectionRunner from "./IProjectionRunner";
import {IProjection} from "./IProjection";
import * as Rx from "rx";
import IReadModelFactory from "../streams/IReadModelFactory";
import {Event} from "../streams/Event";
import {Snapshot} from "../snapshots/ISnapshotRepository";
import Dictionary from "../Dictionary";
import {mergeStreams} from "./ProjectionStream";
import IDateRetriever from "../util/IDateRetriever";
import {SpecialState, StopSignallingState} from "./SpecialState";
import ProjectionStats from "./ProjectionStats";
import ReservedEvents from "../streams/ReservedEvents";

export class ProjectionRunner<T> implements IProjectionRunner<T> {
    public state:T|Dictionary<T>;
    public stats = new ProjectionStats();
    protected streamId:string;
    protected subject:Subject<Event>;
    protected subscription:Rx.IDisposable;
    protected isDisposed:boolean;
    protected isFailed:boolean;
    protected pauser = new Subject<boolean>();

    constructor(protected projection:IProjection<T>, protected stream:IStreamFactory, protected matcher:IMatcher, protected readModelFactory:IReadModelFactory,
                protected tickScheduler:IStreamFactory, protected dateRetriever:IDateRetriever) {
        this.subject = new Subject<Event>();
        this.streamId = projection.name;
    }

    notifications() {
        return this.subject;
    }

    run(snapshot?:Snapshot<T|Dictionary<T>>):void {
        if (this.isDisposed)
            throw new Error(`${this.streamId}: cannot run a disposed projection`);

        if (this.subscription !== undefined)
            return;

        this.state = snapshot ? snapshot.memento : this.matcher.match(SpecialNames.Init)();
        this.notifyStateChange(new Date(1));
        let combinedStream = new Rx.Subject<Event>();
        let completions = new Rx.Subject<void>();

        this.subscription = combinedStream
            .pausableBuffered(this.pauser)
            .subscribe(event => {
                try {
                    let matchFunction = this.matcher.match(event.type);
                    if (matchFunction !== Rx.helpers.identity) {
                        let newState = matchFunction(this.state, event.payload, event);
                        if (newState instanceof SpecialState)
                            this.state = (<SpecialState<T>>newState).state;
                        else
                            this.state = newState;
                        if (!(newState instanceof StopSignallingState))
                            this.notifyStateChange(event.timestamp);
                        this.applyEventStats(event);
                    } else {
                        this.discardEventStats(event);
                    }
                    if (event.type === ReservedEvents.FETCH_EVENTS)
                        completions.onNext(null);
                } catch (error) {
                    console.log(error);
                    this.isFailed = true;
                    this.subject.onError(error);
                    this.stop();
                }
            });

        this.resume();

        mergeStreams(
            combinedStream,
            this.stream.from(snapshot ? snapshot.lastEvent : null, completions, this.projection.definition),
            this.readModelFactory.from(null).filter(event => event.type !== this.streamId),
            this.tickScheduler.from(null),
            this.dateRetriever);
    }

    protected applyEventStats(event: Event) {
        if (event.timestamp)
            this.stats.events++;
        else
            this.stats.readModels++;
    }

    protected discardEventStats(event: Event) {
        if (event.timestamp)
            this.stats.discardedEvents++;
        else
            this.stats.discardedReadModels++;
    }

    stop(): void {
        this.isDisposed = true;

        if (this.subscription)
            this.subscription.dispose();
        if (!this.isFailed)
            this.subject.onCompleted();
    }

    pause():void {
        this.pauser.onNext(false);
    }

    resume():void {
        this.pauser.onNext(true);
    }

    dispose():void {
        this.stop();
        if (!this.subject.isDisposed)
            this.subject.dispose();
    }

    protected notifyStateChange(timestamp:Date, splitKey?:string) {
        this.subject.onNext({payload: this.state, type: this.streamId, timestamp: timestamp, splitKey: null});
        this.readModelFactory.publish({payload: this.state, type: this.streamId, timestamp: null, splitKey: null});
    }
}

