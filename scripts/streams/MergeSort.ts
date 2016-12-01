import {Observable, CompositeDisposable} from "rx";
import {Event} from "./Event";
import * as _ from "lodash";

export default function (observables: Observable<Event>[]): Observable<Event> {
    return Observable.create<Event>(observer => {
        let buffers: Event[][] = [];
        let activeObservables = observables.length;
        let disposable = new CompositeDisposable();

        _.forEach(observables, (observable, i) => {
            disposable.add(observable.subscribe(event => {
                if (!buffers[i]) buffers[i] = [];
                buffers[i].push(event);
                let observablesWithItems = _.filter(buffers, buffer => buffer.length).length;
                if (observablesWithItems === activeObservables) {
                    let item = getLowestItem(buffers);
                    if (item) observer.onNext(item);
                }
            }, error => {
                observer.onError(error);
            }, () => {
                activeObservables--;
                if (!activeObservables) {
                    let flushed = false;
                    while (!flushed) {
                        let item = getLowestItem(buffers);
                        if (item) observer.onNext(item);
                        else flushed = true;
                    }
                    observer.onCompleted();
                }
            }));
        });

        return disposable;
    });
}

function getLowestItem(buffers: Event[][]): Event {
    let lowestItems = peekLowestItems(buffers);
    if (!lowestItems.length) {
        return null;
    }
    let min = _.minBy(lowestItems, item => item.event.timestamp);
    buffers[min.index].shift();
    return min.event;
}

function peekLowestItems(buffers: Event[][]) {
    return _(buffers).map((buffer, i) => {
        return buffer[0] ? {event: buffer[0], index: i} : null;
    }).compact().valueOf();
}