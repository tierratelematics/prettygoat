import {Snapshot} from "../snapshots/ISnapshotRepository";
import {inject, injectable} from "inversify";
import {Event} from "../events/Event";
import {Observable, ReplaySubject, Subscription, VirtualTimeScheduler} from "rxjs";
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
        let combined = new ReplaySubject<Event>();
        let subscriptions = new Subscription();
        let scheduler = new VirtualTimeScheduler();

        subscriptions.add(events.subscribe(event => {
            if (event.type === SpecialEvents.REALTIME) {
                if (!realtime) {
                    scheduler.maxFrames = Number.POSITIVE_INFINITY;
                    scheduler.flush();
                }
                realtime = true;
            }
            if (realtime) {
                combined.next(event);
            } else {
                scheduler.schedule(() => {
                    combined.next(event);
                }, +event.timestamp - scheduler.frame);
                try {
                    scheduler.maxFrames = +event.timestamp;
                    scheduler.flush();
                } catch (error) {
                    combined.error(error);
                }
            }
        }, error => combined.error(error), () => combined.complete()));

        subscriptions.add(ticks.subscribe((event: Event<Tick>) => {
            if (realtime || event.payload.clock > dateRetriever.getDate()) {
                Observable.empty().delay(event.timestamp).subscribe(null, null, () => combined.next(event));
            } else {
                scheduler.schedule(() => {
                    combined.next(event);
                }, +event.payload.clock - scheduler.frame);
            }
        }));

        return combined.finally(() => subscriptions.unsubscribe());
    }
}
