import {Event} from "../streams/Event";
import {Observable, Subject, Disposable, helpers, HistoricalScheduler} from "rx";
import ReservedEvents from "../streams/ReservedEvents";
import * as _ from "lodash";
import Tick from "../ticks/Tick";

export function mergeStreams(combined:Subject<Event>, events:Observable<Event>, readModels:Observable<Event>, ticks:Observable<Event>) {
    let realtime = false;
    let scheduler = new HistoricalScheduler(0, helpers.defaultSubComparer);
    let eventsStream = events.merge(readModels).filter(event => !_.startsWith(event.type, "__diagnostic"));

    ticks.subscribe(event => {
        if (realtime) {
            Observable.empty().delay(event.timestamp).subscribeOnCompleted(() => combined.onNext(event));
        } else {
            scheduler.scheduleFuture(null, (<Tick>event.payload).clock, (scheduler, state) => {
                combined.onNext(event);
                return Disposable.empty;
            });
        }
    });

    eventsStream.subscribe(event => {
        if (event.type === ReservedEvents.REALTIME) {
            if (!realtime)
                scheduler.advanceTo(8640000000000000); //Flush events buffer since there are no more events
            realtime = true;
            return;
        }
        if (realtime || !event.timestamp) {
            combined.onNext(event);
        } else {
            scheduler.scheduleFuture(null, event.timestamp, (scheduler, state) => {
                combined.onNext(event);
                return Disposable.empty;
            });
            scheduler.advanceTo(+event.timestamp);
        }
    });
}