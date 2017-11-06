import {Subject, Observable, Scheduler} from "rxjs";
import {ISubscription} from "rxjs/Subscription";
import {Snapshot} from "../snapshots/ISnapshotRepository";
import Dictionary from "../common/Dictionary";
import {isPromise, toArray} from "../common/TypesUtil";
import {IProjectionRunner} from "./IProjectionRunner";
import {IProjection} from "./IProjection";
import {IMatcher} from "./Matcher";
import {Event} from "../events/Event";
import SpecialEvents from "../events/SpecialEvents";
import {mapValues} from "lodash";
import {IStreamFactory} from "../events/IStreamFactory";
import DefinitionUtil from "../common/DefinitionUtil";
import {IIdempotenceFilter} from "../events/IdempotenceFilter";
import {NullLogger, ILogger} from "inversify-logging";

export class ProjectionStats {
    running = false;
    events = 0;
    lastEvent: Date;
    realtime = false;
    failed = false;
}

export class ProjectionRunner<T> implements IProjectionRunner<T> {
    state: T;
    stats = new ProjectionStats();
    closed: boolean;
    private subject = new Subject<[Event<T>, Dictionary<string[]>]>();
    private subscription: ISubscription;

    constructor(private projection: IProjection<T>, private streamFactory: IStreamFactory,
                private matcher: IMatcher, private notifyMatchers: Dictionary<IMatcher>,
                private idempotenceFilter: IIdempotenceFilter, private logger: ILogger = NullLogger) {

    }

    notifications() {
        return this.subject;
    }

    run(snapshot?: Snapshot<T>): void {
        if (this.closed)
            throw new Error(`${this.projection.name}: cannot run a disposed projection`);

        if (this.subscription !== undefined)
            return;

        if (snapshot && snapshot.memento) {
            this.state = (<any>snapshot.memento).state ? (<any>snapshot.memento).state: snapshot.memento;
            this.notifyStateChange(snapshot.lastEvent, null, mapValues(this.notifyMatchers, matcher => [null]));
            this.logger.info("Restoring projection from a snapshot");
        } else {
            this.logger.info("Starting the projection without a snapshot");
        }
        this.stats = new ProjectionStats();
        this.startStream(snapshot);
        this.stats.running = true;
    }

    private notifyStateChange(timestamp: Date, eventId: string, notificationKeys: Dictionary<string[]>) {
        this.subject.next([{
            id: eventId,
            payload: this.state,
            type: this.projection.name,
            timestamp: timestamp
        }, notificationKeys]);
    }

    private startStream(snapshot: Snapshot<T>) {
        let completions = new Subject<string>(),
            initEvent = {
                type: "$init",
                payload: null,
                timestamp: new Date(0)
            };

        let ringBuffer = snapshot ? snapshot.ringBuffer : [],
            lastEvent = snapshot ? snapshot.lastEvent : null,
            query = {
                name: this.projection.name,
                manifests: DefinitionUtil.getManifests(this.projection.definition),
                from: ringBuffer[0] ? ringBuffer[0].timestamp : lastEvent
            };

        this.idempotenceFilter.setItems(ringBuffer);
        this.logger.info(`Start getting events from ${query.from}`);

        this.subscription = this.streamFactory.from(query, this.idempotenceFilter, completions)
            .startWith(!snapshot && initEvent)
            .map<Event, [Event, Function]>(event => [event, this.matcher.match(event.type)])
            .flatMap<any, any>(data => Observable.defer(() => {
                let [event, matchFn] = data;
                let state = matchFn ? matchFn(this.state, event.payload, event) : this.state;
                // I'm not resolving every state directly with a Promise since this messes up with the
                // synchronicity of the TickScheduler
                return isPromise(state) ? state.then(newState => [event, newState, matchFn]) : Observable.of([event, state, matchFn]);
            }).observeOn(Scheduler.queue), 1)
            .do(data => {
                this.logger.debug(`Processed event ${JSON.stringify(data[0])}`);
                if (data[0].type === SpecialEvents.FETCH_EVENTS) {
                    completions.next(data[0].payload.event);
                }
                if (data[0].type === SpecialEvents.REALTIME) {
                    this.stats.realtime = true;
                    this.logger.info("Switching from replay to realtime");
                }
                this.stats.events++;
                if (data[0].timestamp) this.stats.lastEvent = data[0].timestamp;
            })
            .filter(data => data[2])
            .subscribe(data => {
                let [event, newState] = data;
                this.state = newState;

                this.notifyStateChange(event.timestamp, event.id, this.getNotificationKeys(event));
            }, error => {
                this.stats.failed = true;
                this.subject.error(error);
                this.stop();
            }, () => this.subject.complete());
    }

    private getNotificationKeys(event: Event) {
        return mapValues(this.notifyMatchers, matcher => {
            let matchFn = matcher.match(event.type);
            return matchFn ? toArray<string>(matchFn(this.state, event.payload)) : [null];
        });
    }

    stop(): void {
        if (this.closed) throw Error("Projection already stopped");

        this.closed = true;
        this.stats.running = false;

        if (this.subscription) this.subscription.unsubscribe();
        if (!this.stats.failed) this.subject.complete();
    }

    unsubscribe(): void {
        this.stop();

        if (!this.subject.closed) this.subject.unsubscribe();
    }
}
