import {Observable, CompositeDisposable} from "rx";
import {Event} from "./Event";
import * as _ from "lodash";

export default function (observables: Observable<Event>[]): Observable<Event> {
    return Observable.create<Event>(observer => {
        let buffers: Event[][] = _.map(observables, o => []);
        let completed:boolean[] = _.map(observables, o => false);
        let disposable = new CompositeDisposable();

        _.forEach(observables, (observable, i) => {
            disposable.add(observable.subscribe(event => {
                buffers[i].push(event);
                if (observablesHaveEmitted(buffers, completed)) {
                    let item = getLowestItem(buffers);
                    if (item) observer.onNext(item);
                }
            }, error => {
                observer.onError(error);
            }, () => {
                completed[i] = true;
                if (_.every(completed, completion => completion)) {
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

function observablesHaveEmitted(buffers:Event[][], completed:boolean[]): boolean {
    return _.every(buffers, (buffer, i) => completed[i] || buffer.length);
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