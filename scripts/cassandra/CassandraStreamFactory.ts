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
            .map(() => this.buildQueryFromBuckets(lastEvent, this.timePartitioner.bucketsFrom(lastEvent)))
            .map(query => this.filterQuery(query, this.eventsFilter.filter(definition)))
            .flatMap(query => this.client.stream(query))
            .map(row => this.deserializer.toEvent(row));
    }

    private getEvents():Observable<string[]> {
        return this.client.execute("select distinct timebucket, ser_manifest from event_by_manifest")
            .map(buckets => buckets.rows)
            .map(row => row.ser_manifest)
            .map(eventTypes => <string[]>_.uniq(eventTypes));
    }

    private buildQueryFromBuckets(lastEvent:Date, buckets:string[]):string {
        let bucketsString = buckets.join("', '"),
            timestamp = lastEvent.toISOString();
        return `select blobAsText(event), timestamp from event_by_manifest where timebucket in ('${bucketsString}') and timestamp > maxTimeUuid('${timestamp}')`;
    }

    private filterQuery(query:string, events:string[]):string {
        let eventsString = events.join("', '");
        return query + ` and ser_manifest in ('${eventsString}')`;
    }
}

export default CassandraStreamFactory