import {Subject, IDisposable, Observable} from "rx";
import {SpecialNames} from "../matcher/SpecialNames";
import {IMatcher} from "../matcher/IMatcher";
import {IProjection} from "./IProjection";
import IReadModelFactory from "../streams/IReadModelFactory";
import {Event} from "../streams/Event";
import {Snapshot} from "../snapshots/ISnapshotRepository";
import Dictionary from "../util/Dictionary";
import ProjectionStats from "./ProjectionStats";
import ReservedEvents from "../streams/ReservedEvents";
import Identity from "../matcher/Identity";
import {isPromise} from "../util/TypesUtil";
import {untypedFlatMapSeries} from "../util/RxOperators";
import {IProjectionStreamGenerator} from "./ProjectionStreamGenerator";
import {IProjectionRunner, RunnerNotification} from "./IProjectionRunner";

class ProjectionRunner<T> implements IProjectionRunner<T> {
    state: T;
    stats = new ProjectionStats();
    protected subject: Subject<RunnerNotification<Event<T>>> = new Subject<RunnerNotification<Event<T>>>();
    protected subscription: IDisposable;
    protected isDisposed: boolean;
    protected isFailed: boolean;

    constructor(protected projection: IProjection<T>, protected streamGenerator: IProjectionStreamGenerator, protected matcher: IMatcher,
                protected notificationMatcher: IMatcher, protected readModelFactory: IReadModelFactory) {

    }

    notifications() {
        return this.subject;
    }

    run(snapshot?: Snapshot<T>): void {
        if (this.isDisposed)
            throw new Error(`${this.projection.name}: cannot run a disposed projection`);

        if (this.subscription !== undefined)
            return;

        this.stats.running = true;
        this.subscribeToStateChanges();
        this.state = snapshot ? snapshot.memento : this.matcher.match(SpecialNames.Init)();
        this.notifyStateChange(snapshot ? snapshot.lastEvent : new Date(1));
        this.startStream(snapshot);
    }

    private subscribeToStateChanges() {
        this.subject.sample(100).subscribe(notification => {
            this.readModelFactory.publish({
                payload: notification[0].payload,
                type: notification[0].type,
                timestamp: null
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
            })
            .filter(data => data[1] !== Identity)
            .do(data => this.updateStats(data[0]))
            .let(untypedFlatMapSeries(data => {
                let [event, matchFn] = data;
                let state = matchFn(this.state, event.payload, event);
                // I'm not resolving every state directly with a Promise since this messes up with the
                // synchronicity of the TickScheduler
                return isPromise(state) ? state.then(newState => [event, newState]) : Observable.just([event, state]);
            }))
            .map<[Event, boolean]>(data => {
                let [event, newState] = data;
                this.state = newState;
                return event;
            })
            .let(untypedFlatMapSeries(event => {
                let notificationFn = this.notificationMatcher.match(event.type);
                if (notificationFn !== Identity) {
                    let keys = notificationFn(this.state, event.payload);
                    return isPromise(keys) ? keys.then(notifyKeys => [event, notifyKeys]) : Observable.just([event, keys]);
                } else {
                    return Observable.just([event, null]);
                }
            }))
            .subscribe(data => {
                let [event, keys] = data;
                this.notifyStateChange(event.timestamp, keys);
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

    private notifyStateChange(timestamp: Date, notifyKeys?: string[]) {
        this.subject.onNext([{
            payload: this.state,
            type: this.projection.name,
            timestamp: timestamp
        }, notifyKeys || null]);
    }
}

export default ProjectionRunner
