import {IStreamFactory} from "../streams/IStreamFactory";
import {injectable, inject} from "inversify";
import TimePartitioner from "./TimePartitioner";
import {Event} from "../streams/Event";
import {IWhen} from "../projections/IProjection";
import * as _ from "lodash";
import {ICassandraClient, IQuery} from "./ICassandraClient";
import {Observable} from "rx";
import IEventsFilter from "./IEventsFilter";
import {mergeSort} from "./MergeSort";
import IDateRetriever from "../util/IDateRetriever";
import ICassandraConfig from "../configs/ICassandraConfig";
import * as moment from "moment";
import IEventDeserializer from "../streams/IEventDeserializer";

@injectable()
class CassandraStreamFactory implements IStreamFactory {

    constructor(@inject("ICassandraClient") private client: ICassandraClient,
                @inject("TimePartitioner") private timePartitioner: TimePartitioner,
                @inject("IEventDeserializer") private deserializer: IEventDeserializer,
                @inject("IEventsFilter") private eventsFilter: IEventsFilter,
                @inject("IDateRetriever") private dateRetriever: IDateRetriever,
                @inject("ICassandraConfig") private config: ICassandraConfig) {
    }

    from(lastEvent: Date, completions?: Observable<string>, definition?: IWhen<any>): Observable<Event> {
        let eventsList: string[] = [];
        return this.getEvents()
            .map(events => this.eventsFilter.setEventsList(events))
            .do(() => eventsList = this.eventsFilter.filter(definition))
            .flatMap(() => this.getBuckets(lastEvent))
            .map(buckets => {
                return Observable.from(buckets).flatMapWithMaxConcurrent(1, bucket => {
                    return mergeSort(_.map(eventsList, event => {
                        return this.client
                            .paginate(this.buildQuery(lastEvent, bucket, event), completions)
                            .map(row => this.deserializer.toEvent(row));
                    }));
                });
            })
            .concatAll();
    }

    private getEvents(): Observable<string[]> {
        return this.client.execute(["select distinct ser_manifest from event_types", null])
            .map(buckets => buckets.rows)
            .map(rows => _.map(rows, (row: any) => row.ser_manifest));
    }

    private getBuckets(date: Date): Observable<string[]> {
        if (date)
            return Observable.just(this.timePartitioner.bucketsFrom(date));
        return this.client.execute(["select distinct timebucket from event_by_timestamp", null])
            .map(buckets => buckets.rows)
            .map(rows => _.map(rows, (row: any) => row.timebucket).sort());
    }

    private buildQuery(startDate: Date, bucket: string, event: string): IQuery {
        let query = "select blobAsText(event) as event, timestamp from event_by_manifest " +
                "where timebucket = :bucket and ser_manifest = :event and timestamp < minTimeUuid(:endDate)",
            params:any = {
                bucket: bucket,
                event: event
            };

        if (startDate) {
            query += " and timestamp > maxTimeUuid(:startDate)";
            params.startDate = startDate.toISOString();
        }
        params.endDate = moment(this.dateRetriever.getDate()).subtract(this.config.readDelay || 500, "milliseconds").toDate().toISOString();

        return [query, params];
    }
}

export default CassandraStreamFactory