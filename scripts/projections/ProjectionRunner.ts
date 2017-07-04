import {Subject, IDisposable, Observable, Scheduler} from "rx";
import {Snapshot} from "../snapshots/ISnapshotRepository";
import Dictionary from "../common/Dictionary";
import {isPromise} from "../common/TypesUtil";
import {IProjectionStreamGenerator} from "./ProjectionStreamGenerator";
import {IProjectionRunner} from "./IProjectionRunner";
import {IProjection} from "./IProjection";
import {IMatcher} from "./Matcher";
import {Event} from "../events/Event";
import SpecialEvents from "../events/SpecialEvents";
import {keys, map, zipObject, mapValues} from "lodash";

export class ProjectionStats {
    running = false;
    events = 0;
    lastEvent: Date;
    realtime = false;
}

export class ProjectionRunner<T> implements IProjectionRunner<T> {
    state: T;
    stats = new ProjectionStats();
    private subject = new Subject<[Event<T>, Dictionary<string[]>]>();
    private subscription: IDisposable;
    private disposed: boolean;
    private failed: boolean;

    constructor(private projection: IProjection<T>, private streamGenerator: IProjectionStreamGenerator,
                private matcher: IMatcher, private notifyMatchers: Dictionary<IMatcher>) {

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
            this.notifyStateChange(snapshot.lastEvent, mapValues(this.notifyMatchers, matcher => [null]));
        }
        this.startStream(snapshot);
        this.stats.running = true;
    }

    private notifyStateChange(timestamp: Date, notificationKeys: Dictionary<string[]>) {
        this.subject.onNext([{
            payload: this.state,
            type: this.projection.name,
            timestamp: timestamp
        }, notificationKeys]);
    }

    private startStream(snapshot: Snapshot<Dictionary<T> | T>) {
        let completions = new Subject<string>(),
            initEvent = {
                type: "$init",
                payload: null,
                timestamp: new Date(1)
            };

        this.subscription = this.streamGenerator.generate(this.projection, snapshot, completions)
            .startWith(!snapshot && initEvent)
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
            .flatMapWithMaxConcurrent(1, data => Observable.defer(() => {
                let [event, matchFn] = data;
                let state = matchFn(this.state, event.payload, event);
                // I'm not resolving every state directly with a Promise since this messes up with the
                // synchronicity of the TickScheduler
                return isPromise(state) ? state.then(newState => [event, newState]) : Observable.just([event, state]);
            }).observeOn(Scheduler.currentThread))
            .map(data => {
                let [event, newState] = data;
                this.state = newState;

                let publishPoints = keys(this.notifyMatchers),
                    notificationKeys = map(this.notifyMatchers, matcher => {
                        if (!matcher) return [null];
                        else {
                            let matchFn = matcher.match(event.type);
                            return matchFn ? matchFn(this.state, event.payload) : [null];
                        }
                    });

                return [event, zipObject(publishPoints, notificationKeys)];
            })
            .subscribe(data => {
                let [event, notificationKeys] = data;
                this.notifyStateChange(event.timestamp, notificationKeys);
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
