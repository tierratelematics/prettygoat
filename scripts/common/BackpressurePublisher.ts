import IAsyncPublisher from "./IAsyncPublisher";
import {Subject, Observable} from "rxjs";
import {injectable} from "inversify";
import {IScheduler} from "rxjs/Scheduler";
import {IProjectionRunner} from "../projections/IProjectionRunner";
import {BackpressureConfig} from "../configs/BackpressureConfig";
import { toArray } from "./TypesUtil";
import {last, map, uniq, union} from "lodash";

@injectable()
class BackpressurePublisher<T> implements IAsyncPublisher<T> {

    private historical: Subject<T>;
    private realtime: Subject<T>;

    constructor(private runner: IProjectionRunner, private backpressureConfig = new BackpressureConfig(), private scheduler?: IScheduler,
                historicalData?: Subject<T>, realtimeData?: Subject<T>) {
        this.historical = historicalData || new Subject();
        this.realtime = realtimeData || new Subject();
    }

    publish(item: T) {
        if (this.runner.stats.realtime) {
            this.historical.complete();
            this.realtime.next(item);
        }
        else
            this.historical.next(item);
    }

    items(grouping: (item: T) => string | string[] = (item => null)): Observable<T> {
        return this.sampleItems(grouping).map(value => value[0]);
    }

    private sampleItems(grouping: (item: T) => string | string[]): Observable<[T, string]> {
        return this.historical
            .flatMap(value => Observable.from(this.groupsFromValue(value, grouping)))
            .groupBy(value => value[1])
            .flatMap(group => group.debounceTime(this.backpressureConfig.replay, this.scheduler))
            .concat(this.realtime
                        .flatMap(value => Observable.from(this.groupsFromValue(value, grouping)))
                        .groupBy(value => value[1])
                        .flatMap(group => group.sampleTime(this.backpressureConfig.realtime, this.scheduler)));
    }

    private groupsFromValue(value: T, grouping: (item: T) => string | string[]): [T, string][] {
        return map<string, [T, string]>(toArray<string>(grouping(value)), group => [value, group]);
    }

}

export default BackpressurePublisher
