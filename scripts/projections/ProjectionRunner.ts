import {Subject, IDisposable} from "rx";
import {SpecialNames} from "../matcher/SpecialNames";
import {IMatcher} from "../matcher/IMatcher";
import {IStreamFactory} from "../streams/IStreamFactory";
import IProjectionRunner from "./IProjectionRunner";
import * as Rx from "rx";
import IReadModelFactory from "../streams/IReadModelFactory";
import {Event} from "../streams/Event";
import {Snapshot} from "../snapshots/ISnapshotRepository";
import Dictionary from "../Dictionary";
import * as _ from "lodash";
import Tick from "../ticks/Tick";
import ReservedEvents from "../streams/ReservedEvents";

export class ProjectionRunner<T> implements IProjectionRunner<T> {
    public state:T;
    private subject:Subject<Event>;
    private subscription:Rx.CompositeDisposable;
    private isDisposed:boolean;
    private isFailed:boolean;
    private realtime = false;

    constructor(private streamId, private stream:IStreamFactory, private matcher:IMatcher, private readModelFactory:IReadModelFactory,
                private tickScheduler:IStreamFactory) {
        this.subject = new Subject<Event>();
    }

    notifications() {
        return this.subject;
    }

    run(snapshot?:Snapshot<T|Dictionary<T>>):void {
        if (this.isDisposed)
            throw new Error(`${this.streamId}: cannot run a disposed projection`);

        if (this.subscription !== undefined)
            return;

        this.subscription = new Rx.CompositeDisposable();
        this.state = snapshot ? snapshot.memento : this.matcher.match(SpecialNames.Init)();
        this.publishReadModel(new Date(1));

        let scheduler = new Rx.HistoricalScheduler(0, Rx.helpers.defaultSubComparer);
        let combinedStream = new Rx.Subject<Event>();

        let eventsStream = this.stream
            .from(snapshot ? snapshot.lastEvent : null)
            .merge(this.readModelFactory.from(null))
            .filter(event => event.type !== this.streamId && !_.startsWith(event.type, "__diagnostic"));

        this.subscription.add(combinedStream.subscribe(event => {
            try {
                let matchFunction = this.matcher.match(event.type);
                if (matchFunction !== Rx.helpers.identity) {
                    this.state = matchFunction(this.state, event.payload, event);
                    this.publishReadModel(event.timestamp);
                }
            } catch (error) {
                this.isFailed = true;
                this.subject.onError(error);
                this.stop();
            }
        }));

        this.subscription.add(this.tickScheduler.from(null).subscribe(event => {
            if (this.realtime) {
                Rx.Observable.empty().delay(event.timestamp).subscribeOnCompleted(() => combinedStream.onNext(event));
            } else {
                scheduler.scheduleFuture(null, (<Tick>event.payload).clock, (scheduler, state) => {
                    combinedStream.onNext(event);
                    return Rx.Disposable.empty;
                });
            }
        }));

        this.subscription.add(eventsStream.subscribe(event => {
            if (event.type === ReservedEvents.REALTIME && !this.realtime) {
                this.realtime = true;
                scheduler.advanceTo(8640000000000000); //Flush events buffer since there are no more events
            }
            if (this.realtime || !event.timestamp) {
                combinedStream.onNext(event);
            } else {
                scheduler.scheduleFuture(null, event.timestamp, (scheduler, state) => {
                    combinedStream.onNext(event);
                    return Rx.Disposable.empty;
                });
                scheduler.advanceTo(+event.timestamp);
            }
        }));
    }

    stop():void {
        this.isDisposed = true;

        if (this.subscription)
            this.subscription.dispose();
        if (!this.isFailed)
            this.subject.onCompleted();
    }

    dispose():void {
        this.stop();
        if (!this.subject.isDisposed)
            this.subject.dispose();
    }

    private publishReadModel(timestamp:Date) {
        this.subject.onNext({payload: this.state, type: this.streamId, timestamp: timestamp, splitKey: null});
        this.readModelFactory.publish({payload: this.state, type: this.streamId, timestamp: null, splitKey: null});
    }
}

