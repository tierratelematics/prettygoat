import {Snapshot} from "../snapshots/ISnapshotRepository";
import {inject, injectable} from "inversify";
import {Event} from "../streams/Event";
import {Observable, ReplaySubject, Disposable, helpers, HistoricalScheduler, CompositeDisposable} from "rx";
import ReservedEvents from "../streams/ReservedEvents";
import Tick from "../ticks/Tick";
import IDateRetriever from "../util/IDateRetriever";
import * as _ from "lodash";
import ITickScheduler from "../ticks/ITickScheduler";
import IReadModelFactory from "../streams/IReadModelFactory";
import {IStreamFactory} from "../streams/IStreamFactory";
import {IProjection} from "./IProjection";
import Dictionary from "../util/Dictionary";

export interface IProjectionStreamGenerator {
    generate(projection: IProjection<any>, snapshot: Snapshot<any>, completions: Observable<any>): Observable<Event>;
}

@injectable()
export class ProjectionStreamGenerator implements IProjectionStreamGenerator {

    constructor(@inject("IStreamFactory") private streamFactory: IStreamFactory,
                @inject("IReadModelFactory") private readModelFactory: IReadModelFactory,
                @inject("ITickSchedulerHolder") private tickSchedulerHolder: Dictionary<ITickScheduler>,
                @inject("IDateRetriever") private dateRetriever: IDateRetriever) {

    }

    generate(projection: IProjection<any>, snapshot: Snapshot<any>, completions: Observable<any>) {
        return this.combineStreams(
            this.streamFactory.from(snapshot ? snapshot.lastEvent : null, completions, projection.definition),
            this.readModelFactory.from(null).filter(event => event.type !== projection.name),
            this.tickSchedulerHolder[projection.name].from(null),
            this.dateRetriever
        )
    }

    private combineStreams(events: Observable<Event>, readModels: Observable<Event>, ticks: Observable<Event>, dateRetriever: IDateRetriever) {
        let realtime = false;
        let scheduler = new HistoricalScheduler(0, helpers.defaultSubComparer);
        let combined = new ReplaySubject<Event>();
        let subscriptions = new CompositeDisposable();

        subscriptions.add(events
            .merge(readModels)
            .filter(event => !_.startsWith(event.type, "__diagnostic"))
            .subscribe(event => {
                if (event.type === ReservedEvents.REALTIME) {
                    if (!realtime)
                        scheduler.advanceTo(Number.MAX_VALUE); //Flush events buffer since there are no more events
                    realtime = true;
                }
                if (realtime || !event.timestamp) {
                    combined.onNext(event);
                } else {
                    scheduler.scheduleFuture(null, event.timestamp, () => {
                        combined.onNext(event);
                        return Disposable.empty;
                    });
                    try {
                        scheduler.advanceTo(+event.timestamp);
                    } catch (error) {
                        combined.onError(error);
                    }
                }
            }, error => combined.onError(error), () => combined.onCompleted()));

        subscriptions.add(ticks.subscribe(event => {
            let payload: Tick = event.payload;
            if (realtime || payload.clock > dateRetriever.getDate()) {
                Observable.empty().delay(event.timestamp).subscribeOnCompleted(() => combined.onNext(event));
            } else {
                scheduler.scheduleFuture(null, payload.clock, () => {
                    combined.onNext(event);
                    return Disposable.empty;
                });
            }
        }));

        return combined.finally(() => subscriptions.dispose());
    }


}