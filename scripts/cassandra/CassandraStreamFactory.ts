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
import {mergeSort} from "../projections/ProjectionStream";

@injectable()
class CassandraStreamFactory implements IStreamFactory {

    constructor(@inject("ICassandraClient") private client:ICassandraClient,
                @inject("TimePartitioner") private timePartitioner:TimePartitioner,
                @inject("ICassandraDeserializer") private deserializer:ICassandraDeserializer,
                @inject("IEventsFilter") private eventsFilter:IEventsFilter) {
    }

    from(lastEvent:Date, completions?:Observable<string>, definition?:IWhen<any>):Observable<Event> {
        let eventsList:string[] = [];
        return this.getEvents()
            .map(events => this.eventsFilter.setEventsList(events))
            .do(() => eventsList = this.eventsFilter.filter(definition))
            .flatMap(() => this.getBuckets(lastEvent))
            .map(buckets => {
                return Observable.from(buckets).flatMapWithMaxConcurrent(1, bucket => {
                    return mergeSort(_.map(eventsList, event => {
                        return this.client
                            .paginate(this.buildQuery(lastEvent, bucket), event, completions)
                            .map(row => this.deserializer.toEvent(row));
                    }));
                });
            })
            .concatAll();
    }

    private getEvents():Observable<string[]> {
        return this.client.execute("select distinct ser_manifest from event_types")
            .map(buckets => buckets.rows)
            .map(rows => _.map(rows, (row:any) => row.ser_manifest));
    }

    private getBuckets(date:Date):Observable<string[]> {
        if (date)
            return Observable.just(this.timePartitioner.bucketsFrom(date));
        return this.client.execute("select distinct timebucket from event_by_timestamp")
            .map(buckets => buckets.rows)
            .map(rows => _.map(rows, (row:any) => row.timebucket).sort());
    }

    private buildQuery(lastEvent:Date, bucket:string):string {
        let query = `select blobAsText(event) as event, timestamp from event_by_manifest where timebucket = '${bucket}'`;
        if (lastEvent)
            query += ` and timestamp > maxTimeUuid('${lastEvent.toISOString()}')`;
        return query;
    }
}

export default CassandraStreamFactory