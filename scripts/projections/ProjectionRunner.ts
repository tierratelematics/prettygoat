import {Subject, IDisposable, Observable, ISubject} from "rx";
import {SpecialNames} from "../matcher/SpecialNames";
import {IMatcher} from "../matcher/IMatcher";
import {IStreamFactory} from "../streams/IStreamFactory";
import IProjectionRunner from "./IProjectionRunner";
import {IProjection} from "./IProjection";
import IReadModelFactory from "../streams/IReadModelFactory";
import {Event} from "../streams/Event";
import {Snapshot} from "../snapshots/ISnapshotRepository";
import Dictionary from "../util/Dictionary";
import IDateRetriever from "../util/IDateRetriever";
import {SpecialState, StopSignallingState} from "./SpecialState";
import ProjectionStats from "./ProjectionStats";
import ReservedEvents from "../streams/ReservedEvents";
import Identity from "../matcher/Identity";
import {isPromise} from "../util/TypesUtil";
import {untypedFlatMapSeries} from "../util/RxOperators";
import {IProjectionStreamGenerator} from "./ProjectionStreamGenerator";

class ProjectionRunner<T> implements IProjectionRunner<T> {
    state: T | Dictionary<T>;
    stats = new ProjectionStats();
    protected subject: Subject<Event> = new Subject<Event>();
    protected subscription: IDisposable;
    protected isDisposed: boolean;
    protected isFailed: boolean;

    constructor(protected projection: IProjection<T>, protected streamGenerator: IProjectionStreamGenerator, protected matcher: IMatcher,
                protected readModelFactory: IReadModelFactory, protected realtimeNotifier: ISubject<string>) {

    }

    notifications() {
        return this.subject;
    }

    run(snapshot?: Snapshot<T | Dictionary<T>>): void {
        if (this.isDisposed)
            throw new Error(`${this.projection.name}: cannot run a disposed projection`);

        if (this.subscription !== undefined)
            return;

        this.stats.running = true;
        this.subscribeToStateChanges();
        this.state = snapshot ? snapshot.memento : this.matcher.match(SpecialNames.Init)();
        this.notifyStateChange(new Date(1));
        this.startStream(snapshot);
    }

    //Patch to remove sampling in tests where needed
    protected subscribeToStateChanges() {
        this.subject.sample(100).subscribe(readModel => {
            this.readModelFactory.publish({
                payload: readModel.payload,
                type: readModel.type,
                timestamp: null,
                splitKey: null
            });
        }, error => null);
    }

    protected startStream(snapshot: Snapshot<Dictionary<T> | T>) {
        let completions = new Subject<string>();

        this.subscription = this.streamGenerator.generate(this.projection, snapshot, completions)
            .map<[Event, Function]>(event => [event, this.matcher.match(event.type)])
            .do(data => {
                if (data[0].type === ReservedEvents.FETCH_EVENTS)
                    completions.onNext(data[0].payload.event);
                else if (data[0].type === ReservedEvents.REALTIME)
                    this.realtimeNotifier.onNext(this.projection.name);
            })
            .filter(data => data[1] !== Identity)
            .do(data => this.updateStats(data[0]))
            .let(untypedFlatMapSeries(data => {
                let [event, matchFn] = data;
                let state = matchFn(this.state, event.payload, event);
                //I'm not resolving every state directly with a Promise since this messes up with the
                //synchronicity of the TickScheduler
                return isPromise(state) ? state.then(newState => [event, newState]) : Observable.just([event, state]);
            }))
            .map<[Event, boolean]>(data => {
                let [event, newState] = data;
                if (newState instanceof SpecialState)
                    this.state = (<SpecialState<T>>newState).state;
                else
                    this.state = newState;
                return [event, !(newState instanceof StopSignallingState)];
            })
            .subscribe(data => {
                let [event, notify] = data;
                if (notify) this.notifyStateChange(event.timestamp);
            }, error => {
                this.isFailed = true;
                this.subject.onError(error);
                this.stop();
            }, () => this.subject.onCompleted());
    }

    protected updateStats(event: Event) {
        if (event.timestamp)
            this.stats.events++;
        else
            this.stats.readModels++;
    }

    stop(): void {
        if (this.isDisposed)
            throw Error("Projection already stopped");

        this.isDisposed = true;
        this.stats.running = false;

        if (this.subscription)
            this.subscription.dispose();
        if (!this.isFailed)
            this.subject.onCompleted();
    }

    dispose(): void {
        this.stop();

        if (!this.subject.isDisposed)
            this.subject.dispose();
    }

    protected notifyStateChange(timestamp: Date, splitKey?: string) {
        this.subject.onNext({payload: this.state, type: this.projection.name, timestamp: timestamp, splitKey: null});
    }
}

export default ProjectionRunner