import {Snapshot} from "../snapshots/ISnapshotRepository";
import {inject, injectable} from "inversify";
import {Event} from "../events/Event";
import {Observable, VirtualTimeScheduler} from "rxjs";
import SpecialEvents from "../events/SpecialEvents";
import Tick from "../ticks/Tick";
import IDateRetriever from "../common/IDateRetriever";
import ITickScheduler from "../ticks/ITickScheduler";
import {IProjection} from "./IProjection";
import Dictionary from "../common/Dictionary";
import {IStreamFactory} from "../events/IStreamFactory";

export interface IProjectionStreamGenerator {
    generate(projection: IProjection<any>, snapshot: Snapshot<any>, completions: Observable<any>): Observable<Event>;
}

@injectable()
export class ProjectionStreamGenerator implements IProjectionStreamGenerator {

    constructor(@inject("IStreamFactory") private streamFactory: IStreamFactory,
                @inject("ITickSchedulerHolder") private tickSchedulerHolder: Dictionary<ITickScheduler>,
                @inject("IDateRetriever") private dateRetriever: IDateRetriever) {

    }

    generate(projection: IProjection<any>, snapshot: Snapshot<any>, completions: Observable<any>): Observable<Event> {
        return this.combineStreams(
            this.streamFactory.from(snapshot ? snapshot.lastEvent : null, completions, projection.definition),
            this.tickSchedulerHolder[projection.name].from(null),
            this.dateRetriever
        );
    }

    private combineStreams(events: Observable<Event>, ticks: Observable<Event>, dateRetriever: IDateRetriever) {
        let realtime = false;
        let scheduler = new VirtualTimeScheduler();

        return Observable.create(observer => {
            let subscription = events.subscribe(event => {
                if (event.type === SpecialEvents.REALTIME) {
                    if (!realtime) {
                        scheduler.maxFrames = Number.POSITIVE_INFINITY;
                        scheduler.flush();
                    }
                    realtime = true;
                }
                if (realtime) {
                    observer.next(event);
                } else {
                    scheduler.schedule(() => {
                        observer.next(event);
                    }, +event.timestamp - scheduler.frame);
                    try {
                        scheduler.maxFrames = +event.timestamp;
                        scheduler.flush();
                    } catch (error) {
                        observer.error(error);
                    }
                }
            }, error => observer.error(error), () => observer.complete());

            subscription.add(ticks.subscribe((event: Event<Tick>) => {
                if (realtime || event.payload.clock > dateRetriever.getDate()) {
                    Observable.empty().delay(event.timestamp).subscribe(null, null, () => observer.next(event));
                } else {
                    scheduler.schedule(() => {
                        observer.next(event);
                    }, +event.payload.clock - scheduler.frame);
                }
            }));

            return subscription;
        });
    }
}
