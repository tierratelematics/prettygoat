import {Observable, CompositeDisposable} from "rx";
import {Event} from "./Event";
import * as _ from "lodash";

export default function (observables: Observable<Event>[]): Observable<Event> {
    return Observable.create<Event>(observer => {
        let activeObservables = observables.length;
        let buffers: Event[][] = _.map(observables, o => []);
        let disposable = new CompositeDisposable();
        let lastElement = null;

        _.forEach(observables, (observable, i) => {
            disposable.add(observable.subscribe(event => {
                buffers[i].push(event);
                let observablesWithItems = _.filter(buffers, buffer => buffer.length).length;
                console.log(observablesWithItems, activeObservables);
                if (observablesWithItems >= activeObservables) {
                    let item = getLowestItem(buffers);
                    if (item && lastElement &&  item.timestamp < lastElement.timestamp) {
                        console.log('MERGE SORT ERROR', item, lastElement, buffers);
                    }
                    if (item) observer.onNext(item);
                    if (item)
                        lastElement = item;
                }
            }, error => {
                observer.onError(error);
            }, () => {
                activeObservables--;
                if (!activeObservables) {
                    let flushed = false;
                    while (!flushed) {
                        let item = getLowestItem(buffers);
                        if (item && lastElement &&  item.timestamp < lastElement.timestamp) {
                            console.log('MERGE SORT ERROR', item, lastElement, buffers);
                        }
                        if (item)
                            lastElement = item;
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
    return buffers[min.index].shift();
}

function peekLowestItems(buffers: Event[][]) {
    return _(buffers).map((buffer, i) => {
        return buffer[0] ? {event: buffer[0], index: i} : null;
    }).compact().valueOf();
}