import {IStreamFactory} from "../streams/IStreamFactory";
import {injectable, inject} from "inversify";
import ICassandraConfig from "../configs/ICassandraConfig";
import * as Rx from "rx";
import ICassandraClientFactory from "./ICassandraClientFactory";
import ICassandraDeserializer from "./ICassandraDeserializer";
import TimePartitioner from "../util/TimePartitioner";
import * as Promise from "bluebird";
import {Event} from "../streams/Event";
import ReservedEvents from "../streams/ReservedEvents";
import {IWhen} from "../projections/IProjection";
import EventsFilter from "../streams/EventsFilter";
import * as _ from "lodash";

@injectable()
class CassandraStreamFactory implements IStreamFactory {

    private client:any;

    constructor(@inject("ICassandraClientFactory") clientFactory:ICassandraClientFactory,
                @inject("ICassandraConfig") config:ICassandraConfig,
                @inject("TimePartitioner") private timePartitioner:TimePartitioner,
                @inject("ICassandraDeserializer") private deserializer:ICassandraDeserializer,
                @inject("IEventsFilter") private eventsFilter:EventsFilter) {
        this.client = clientFactory.clientFor(config);
    }

    from(lastEvent:Date, definition?:IWhen<any>):Rx.Observable<Event> {
        return Rx.Observable.create<Event>(observer => {
            Promise.resolve()
                .then(() => this.getEvents())
                .then(events => this.eventsFilter.setEventsList(events))
                .then(() => this.getBuckets(lastEvent))
                .then(buckets => this.buildQueryFromBuckets(lastEvent, buckets))
                .then(query => this.filterQuery(query, this.eventsFilter.filter(definition)))
                .then(query => {
                    let deserializer = this.deserializer;
                    this.client.stream(query)
                        .on('readable', function () {
                            let row;
                            while (row = this.read()) {
                                observer.onNext(deserializer.toEvent(row));
                            }
                        })
                        .on('end', () => {
                            observer.onNext({
                                type: ReservedEvents.REALTIME,
                                payload: null,
                                timestamp: null,
                                splitKey: null
                            });
                            observer.onCompleted();
                        })
                        .on('error', (error) => observer.onError(error));
                });
            return Rx.Disposable.empty;
        });
    }

    private getEvents():Promise<string[]> {
        return Promise
            .fromNode(callback => {
                this.client.execute("SELECT DISTINCT timebucket, ser_manifest FROM event_by_manifest", callback)
            })
            .then(buckets => buckets.rows)
            .map<any, string>(row => row.ser_manifest)
            .then(eventTypes => _.uniq(eventTypes));
    }

    private getBuckets(lastEvent:Date):string[] | Promise<string[]> {
        if (lastEvent)
            return this.timePartitioner.bucketsFrom(lastEvent);
        else
            return Promise
                .fromNode(callback => {
                    this.client.execute("SELECT DISTINCT timebucket, ser_manifest FROM event_by_manifest", callback)
                })
                .then(buckets => buckets.rows)
                .map<any, string>(row => row.timebucket)
                .then(timebuckets => _.uniq(timebuckets))
                .then(buckets => !buckets || (buckets && !buckets.length) ? this.timePartitioner.bucketsFrom(new Date()) : buckets);
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