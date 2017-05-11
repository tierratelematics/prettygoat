import {Event} from "../streams/Event";
import {Observable, Subject, Disposable, helpers, HistoricalScheduler} from "rx";
import ReservedEvents from "../streams/ReservedEvents";
import Tick from "../ticks/Tick";
import IDateRetriever from "../util/IDateRetriever";
import * as _ from "lodash";

export function combineStreams(combined: Subject<Event>, events: Observable<Event>, readModels: Observable<Event>, ticks: Observable<Event>, dateRetriever: IDateRetriever) {
    let realtime = false;
    let scheduler = new HistoricalScheduler(0, helpers.defaultSubComparer);

    events
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
                scheduler.scheduleFuture(null, event.timestamp, (scheduler, state) => {
                    combined.onNext(event);
                    return Disposable.empty;
                });
                try {
                    scheduler.advanceTo(+event.timestamp);
                } catch (error) {
                    combined.onError(error);
                }
            }
        }, error => combined.onError(error), () => combined.onCompleted());

    ticks.subscribe(event => {
        let payload: Tick = event.payload;
        if (realtime || payload.clock > dateRetriever.getDate()) {
            Observable.empty().delay(event.timestamp).subscribeOnCompleted(() => combined.onNext(event));
        } else {
            scheduler.scheduleFuture(null, payload.clock, (scheduler, state) => {
                combined.onNext(event);
                return Disposable.empty;
            });
        }
    });
}
