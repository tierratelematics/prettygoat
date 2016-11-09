import {IStreamFactory} from "../streams/IStreamFactory";
import {injectable, inject} from "inversify";
import ICassandraDeserializer from "./ICassandraDeserializer";
import TimePartitioner from "../util/TimePartitioner";
import {Event} from "../streams/Event";
import {IWhen} from "../projections/IProjection";
import * as _ from "lodash";
import ICassandraClient from "./ICassandraClient";
import {Observable} from "rx";
import IEventsFilter from "../streams/IEventsFilter";

@injectable()
class CassandraStreamFactory implements IStreamFactory {

    constructor(@inject("ICassandraClient") private client:ICassandraClient,
                @inject("TimePartitioner") private timePartitioner:TimePartitioner,
                @inject("ICassandraDeserializer") private deserializer:ICassandraDeserializer,
                @inject("IEventsFilter") private eventsFilter:IEventsFilter) {
    }

    from(lastEvent:Date, definition?:IWhen<any>):Observable<Event> {
        lastEvent = lastEvent || new Date(1420070400000);
        return this.getEvents()
            .map(events => this.eventsFilter.setEventsList(events))
            .map(() => this.timePartitioner.bucketsFrom(lastEvent))
            .map(buckets => Observable.from(buckets).flatMap(bucket => {
                return this.client.stream(this.buildQuery(lastEvent, bucket, this.eventsFilter.filter(definition)))
            }))
            .concatAll()
            .map(row => this.deserializer.toEvent(row));
    }

    private getEvents():Observable<string[]> {
        return this.client.execute("select distinct timebucket, ser_manifest from event_by_manifest")
            .map(buckets => buckets.rows)
            .map(rows => _.map(rows, (row:any) => row.ser_manifest))
            .map(eventTypes => <string[]>_.uniq(eventTypes));
    }

    private buildQuery(lastEvent:Date, bucket:string, events:string[]):string {
        let timestamp = lastEvent.toISOString(),
            eventsString = events.join("', '");
        return `select blobAsText(event), timestamp from event_by_manifest where timebucket = '${bucket}'` +
            ` and timestamp > maxTimeUuid('${timestamp}') and ser_manifest in ('${eventsString}')`;
    }
}

export default CassandraStreamFactory