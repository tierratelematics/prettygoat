import {Event} from "../streams/Event";
import {Observable, Subject, Disposable, helpers, HistoricalScheduler} from "rx";
import ReservedEvents from "../streams/ReservedEvents";
import * as _ from "lodash";
import Tick from "../ticks/Tick";
import IDateRetriever from "../util/IDateRetriever";

export function mergeStreams(combined:Subject<Event>, events:Observable<Event[]>, readModels:Observable<Event>, ticks:Observable<Event>, dateRetriever:IDateRetriever) {
    let realtime = false;
    let scheduler = new HistoricalScheduler(0, helpers.defaultSubComparer);

    events.subscribe(events => _.forEach(events, event => handleEvent(event)));
    readModels
        .filter(event => !_.startsWith(event.type, "__diagnostic"))
        .subscribe(event => handleEvent(event));

    function handleEvent(event:Event) {
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
    }

    ticks.subscribe(event => {
        let payload:Tick = event.payload;
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