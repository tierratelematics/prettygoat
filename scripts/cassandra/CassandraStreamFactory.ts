import {IStreamFactory} from "../streams/IStreamFactory";
import {injectable, inject} from "inversify";
import ICassandraDeserializer from "./ICassandraDeserializer";
import TimePartitioner from "../util/TimePartitioner";
import {Event} from "../streams/Event";
import {IWhen} from "../projections/IProjection";
import EventsFilter from "../streams/EventsFilter";
import * as _ from "lodash";
import ICassandraClient from "./ICassandraClient";
import {Observable} from "rx";

@injectable()
class CassandraStreamFactory implements IStreamFactory {

    constructor(@inject("ICassandraClient") private client:ICassandraClient,
                @inject("TimePartitioner") private timePartitioner:TimePartitioner,
                @inject("ICassandraDeserializer") private deserializer:ICassandraDeserializer,
                @inject("IEventsFilter") private eventsFilter:EventsFilter) {
    }

    from(lastEvent:Date, definition?:IWhen<any>):Observable<Event> {
        return this.getEvents()
            .map(events => this.eventsFilter.setEventsList(events))
            .flatMap(() => this.getBuckets(lastEvent))
            .map(buckets => this.buildQueryFromBuckets(lastEvent, buckets))
            .map(query => this.filterQuery(query, this.eventsFilter.filter(definition)))
            .flatMap(query => this.client.stream(query))
            .map(row => this.deserializer.toEvent(row));
    }

    private getEvents():Observable<string[]> {
        return this.client.execute("SELECT DISTINCT timebucket, ser_manifest FROM event_by_manifest")
            .map(buckets => buckets.rows)
            .map(row => row.ser_manifest)
            .map(eventTypes => <string[]>_.uniq(eventTypes));
    }

    private getBuckets(lastEvent:Date):Observable<string[]> {
        if (lastEvent)
            return Observable.just<string[]>(this.timePartitioner.bucketsFrom(lastEvent));
        else
            return this.client.execute("SELECT DISTINCT timebucket, ser_manifest FROM event_by_manifest")
                .map(buckets => buckets.rows)
                .map(row => row.timebucket)
                .map(timebuckets => _.uniq(timebuckets))
                .map((buckets:string[]) => !buckets || (buckets && !buckets.length) ? this.timePartitioner.bucketsFrom(new Date()) : buckets);
    }

    private buildQueryFromBuckets(lastEvent:Date, buckets:string[]):string {
        let bucketsString = buckets.join("', '"),
            query = `SELECT blobAsText(event), timestamp FROM event_by_manifest WHERE timebucket IN ('${bucketsString}')`;
        if (lastEvent) {
            let timestamp = lastEvent.toISOString();
            query += ` AND timestamp > maxTimeUuid('${timestamp}')`;
        }
        return query;
    }

    private filterQuery(query:string, events:string[]):string {
        let eventsString = events.join("', '");
        return query + ` AND ser_manifest IN ('${eventsString}')`;
    }
}

export default CassandraStreamFactory