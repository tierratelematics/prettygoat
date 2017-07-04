import {Subject, Observable, Scheduler} from "rxjs";
import {ISubscription} from "rxjs/Subscription";
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
    closed: boolean;
    private subject = new Subject<[Event<T>, Dictionary<string[]>]>();
    private subscription: ISubscription;
    private failed: boolean;

    constructor(private projection: IProjection<T>, private streamGenerator: IProjectionStreamGenerator,
                private matcher: IMatcher, private notifyMatchers: Dictionary<IMatcher>) {

    }

    notifications() {
        return this.subject;
    }

    run(snapshot?: Snapshot<T>): void {
        if (this.closed)
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
        this.subject.next([{
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
            .map<Event, [Event, Function]>(event => [event, this.matcher.match(event.type)])
            .do(data => {
                if (data[0].type === SpecialEvents.FETCH_EVENTS)
                    completions.next(data[0].payload.event);
                if (data[0].type === SpecialEvents.REALTIME)
                    this.stats.realtime = true;
            })
            .filter(data => !!data[1])
            .do(data => {
                this.stats.events++;
                if (data[0].timestamp) this.stats.lastEvent = data[0].timestamp;
            })
            .flatMap<any, any>(data => Observable.defer(() => {
                let [event, matchFn] = data;
                let state = matchFn(this.state, event.payload, event);
                // I'm not resolving every state directly with a Promise since this messes up with the
                // synchronicity of the TickScheduler
                return isPromise(state) ? state.then(newState => [event, newState]) : Observable.of([event, state]);
            }).observeOn(Scheduler.queue), 1)
            .subscribe(data => {
                let [event, newState] = data;
                this.state = newState;

                let publishPoints = keys(this.notifyMatchers),
                    notificationKeys = this.getNotificationKeys(event);

                this.notifyStateChange(event.timestamp, <Dictionary<string[]>>zipObject(publishPoints, notificationKeys));
            }, error => {
                this.failed = true;
                this.subject.error(error);
                this.stop();
            }, () => this.subject.complete());
    }

    private getNotificationKeys(event: Event) {
        return map(this.notifyMatchers, matcher => {
            if (!matcher) return [null];
            else {
                let matchFn = matcher.match(event.type);
                return matchFn ? matchFn(this.state, event.payload) : [null];
            }
        });
    }

    stop(): void {
        if (this.closed) throw Error("Projection already stopped");

        this.closed = true;
        this.stats.running = false;

        if (this.subscription) this.subscription.unsubscribe();
        if (!this.failed) this.subject.complete();
    }

    unsubscribe(): void {
        this.stop();

        if (!this.subject.closed) this.subject.unsubscribe();
    }
}
