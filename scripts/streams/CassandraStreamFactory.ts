import {IStreamFactory} from "./IStreamFactory";
import {injectable, inject} from "inversify";
import ICassandraConfig from "../configs/ICassandraConfig";
import * as Rx from "rx";
import ICassandraClientFactory from "./ICassandraClientFactory";
import TimePartitioner from "../util/TimePartitioner";
import * as Promise from "bluebird";
import Event from "./Event";

@injectable()
class CassandraStreamFactory implements IStreamFactory {

    private client:any;

    constructor(@inject("ICassandraClientFactory") clientFactory:ICassandraClientFactory,
                @inject("ICassandraConfig") config:ICassandraConfig,
                @inject("TimePartitioner") private timePartitioner:TimePartitioner) {
        this.client = clientFactory.clientFor(config);
    }

    from(lastEvent:string):Rx.Observable<Event> {
        return this.streamSource(lastEvent ? new Date(lastEvent) : null)
            .map(event => {
                return {
                    type: event.event.type,
                    payload: event.event.payload,
                    timestamp: event.timestamp.toISOString()
                }
            })
            .observeOn(Rx.Scheduler.default);
    }

    streamSource(lastEvent:Date):Rx.Observable<any> {
        return Rx.Observable.create(observer => {
            Promise.resolve()
                .then(() => this.getBuckets(lastEvent))
                .then(buckets => this.buildQueryFromBuckets(lastEvent, buckets))
                .then(query => {
                    this.client.stream(query)
                        .on('readable', function () {
                            let row;
                            while (row = this.read()) {
                                observer.onNext({
                                    timestamp: row.timestamp.getDate(),
                                    event: JSON.parse(row['system.blobastext(event)'])
                                });
                            }
                        })
                        .on('end', () => observer.onCompleted())
                        .on('error', (error) => observer.onError(error));
                });
            return Rx.Disposable.empty;
        });
    }

    private getBuckets(lastEvent:Date):string[] | Promise<string[]> {
        if (lastEvent)
            return this.timePartitioner.bucketsFrom(lastEvent);
        else
            return Promise
                .fromNode(callback => {
                    this.client.execute("select distinct timebucket from event_by_timestamp", callback)
                })
                .then(buckets => buckets.rows)
                .map<any, string>(row => row.timebucket)
                .then(buckets => !buckets || (buckets && !buckets.length) ? this.timePartitioner.bucketsFrom(new Date()) : buckets);
    }

    private buildQueryFromBuckets(lastEvent:Date, buckets:string[]):string {
        let bucketsString = buckets.join("', '"),
            query = `SELECT blobAsText(event), timestamp FROM event_by_timestamp WHERE timebucket IN ('${bucketsString}')`;
        if (lastEvent) {
            let timestamp = lastEvent.toISOString();
            query += ` AND timestamp > maxTimeUuid('${timestamp}')`;
        }
        return query;
    }
}

export default CassandraStreamFactory