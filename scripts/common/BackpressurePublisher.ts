import IAsyncPublisher from "./IAsyncPublisher";
import {Subject, Observable} from "rxjs";
import {injectable} from "inversify";
import {IScheduler} from "rxjs/Scheduler";
import {IProjectionRunner} from "../projections/IProjectionRunner";
import {BackpressureConfig} from "../configs/BackpressureConfig";

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
        if (this.runner.stats.realtime)
            this.realtime.next(item);
        else
            this.historical.next(item);
    }

    items(): Observable<T> {
        return this.historical.debounceTime(this.backpressureConfig.replay, this.scheduler);
    }

}

export default BackpressurePublisher
