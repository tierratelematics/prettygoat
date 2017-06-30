import {Subject, IDisposable, Observable} from "rx";
import {Snapshot} from "../snapshots/ISnapshotRepository";
import Dictionary from "../util/Dictionary";
import ProjectionStats from "./ProjectionStats";
import {isPromise} from "../util/TypesUtil";
import {untypedFlatMapSeries} from "../util/RxOperators";
import {IProjectionStreamGenerator} from "./ProjectionStreamGenerator";
import {IProjectionRunner} from "./IProjectionRunner";
import {IProjection} from "./IProjection";
import {IMatcher} from "./Matcher";
import {Event} from "../events/Event";
import SpecialEvents from "../events/SpecialEvents";

class ProjectionRunner<T> implements IProjectionRunner<T> {
    state: T;
    stats = new ProjectionStats();
    private subject: Subject<Event<T>> = new Subject<Event<T>>();
    private subscription: IDisposable;
    private disposed: boolean;
    private failed: boolean;

    constructor(protected projection: IProjection<T>, protected streamGenerator: IProjectionStreamGenerator, protected matcher: IMatcher) {

    }

    notifications() {
        return this.subject;
    }

    run(snapshot?: Snapshot<T>): void {
        if (this.disposed)
            throw new Error(`${this.projection.name}: cannot run a disposed projection`);

        if (this.subscription !== undefined)
            return;

        if (snapshot) {
            this.state = snapshot.memento;
            this.notifyStateChange(snapshot.lastEvent);
        }
        this.startStream(snapshot);
        this.stats.running = true;
    }

    private notifyStateChange(timestamp: Date) {
        this.subject.onNext({
            payload: this.state,
            type: this.projection.name,
            timestamp: timestamp
        });
    }

    private startStream(snapshot: Snapshot<Dictionary<T> | T>) {
        let completions = new Subject<string>();

        this.subscription = this.streamGenerator.generate(this.projection, snapshot, completions)
            .startWith(!snapshot && {
                type: "$init",
                payload: null,
                timestamp: new Date(1)
            })
            .map<[Event, Function]>(event => [event, this.matcher.match(event.type)])
            .do(data => {
                if (data[0].type === SpecialEvents.FETCH_EVENTS)
                    completions.onNext(data[0].payload.event);
                if (data[0].type === SpecialEvents.REALTIME)
                    this.stats.realtime = true;
            })
            .filter(data => data[1])
            .do(data => {
                this.stats.events++;
                if (data[0].timestamp) this.stats.lastEvent = data[0].timestamp;
            })
            .let(untypedFlatMapSeries(data => {
                let [event, matchFn] = data;
                let state = matchFn(this.state, event.payload, event);
                // I'm not resolving every state directly with a Promise since this messes up with the
                // synchronicity of the TickScheduler
                return isPromise(state) ? state.then(newState => [event, newState]) : Observable.just([event, state]);
            }))
            .subscribe(data => {
                let [event, newState] = data;
                this.state = newState;
                this.notifyStateChange(event.timestamp);
                return event;
            }, error => {
                this.failed = true;
                this.subject.onError(error);
                this.stop();
            }, () => this.subject.onCompleted());
    }

    stop(): void {
        if (this.disposed)
            throw Error("Projection already stopped");

        this.disposed = true;
        this.stats.running = false;

        if (this.subscription)
            this.subscription.dispose();
        if (!this.failed)
            this.subject.onCompleted();
    }

    dispose(): void {
        this.stop();

        if (!this.subject.isDisposed)
            this.subject.dispose();
    }
}

export default ProjectionRunner
