import {Event} from "../streams/Event";
import {Observable, Subject, Disposable, helpers, HistoricalScheduler, CompositeDisposable, Observer} from "rx";
import ReservedEvents from "../streams/ReservedEvents";
import Tick from "../ticks/Tick";
import IDateRetriever from "../util/IDateRetriever";
import * as _ from "lodash";

export function combineStreams(combined:Subject<Event>, events:Observable<Event>, readModels:Observable<Event>, ticks:Observable<Event>, dateRetriever:IDateRetriever) {
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
        });

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

export function mergeSort(observables: Observable<Event>[]): Observable<Event> {
    return Observable.create<Event>(observer => {
        if (!observables.length) return observer.onCompleted();

        let buffers: Event[][] = _.map(observables, o => []);
        let completed:boolean[] = _.map(observables, o => false);
        let disposable = new CompositeDisposable();

        _.forEach(observables, (observable, i) => {
            disposable.add(observable.subscribe(event => {
                buffers[i].push(event);
                loop(buffers, completed, observer);
            }, error => {
                observer.onError(error);
            }, () => {
                completed[i] = true;
                if (_.every(completed, completion => completion)) {
                    flushBuffer(buffers, observer);
                    observer.onCompleted();
                } else {
                    loop(buffers, completed, observer);
                }
            }));
        });

        return disposable;
    });
}

function loop(buffers:Event[][], completed:boolean[], observer:Observer<Event>) {
    while (observablesHaveEmitted(buffers, completed)) {
        let item = getLowestItem(buffers);
        if (item) observer.onNext(item);
    }
}

function flushBuffer(buffers:Event[][], observer:Observer<Event>) {
    let item = null;
    do {
        item = getLowestItem(buffers);
        if (item) observer.onNext(item);
    } while (item)
}

function observablesHaveEmitted(buffers:Event[][], completed:boolean[]): boolean {
    return _.every(buffers, (buffer, i) => completed[i] || buffer.length);
}

function getLowestItem(buffers: Event[][]): Event {
    let lowestItems = peekLowestItems(buffers);
    if (!lowestItems.length) {
        return null;
    }
    let min = _.minBy(lowestItems, item => !item.event.timestamp ? 0 : item.event.timestamp);
    return buffers[min.index].shift();
}

function peekLowestItems(buffers: Event[][]) {
    return _(buffers).map((buffer, i) => {
        return buffer[0] ? {event: buffer[0], index: i} : null;
    }).compact().valueOf();
}