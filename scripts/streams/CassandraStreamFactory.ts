import {IStreamFactory} from "./IStreamFactory";
import {injectable, inject} from "inversify";
import ICassandraConfig from "../configs/ICassandraConfig";
import * as Rx from "rx";
import StreamState from "./StreamState";
import ICassandraClientFactory from "./ICassandraClientFactory";
import TimePartitioner from "./TimePartitioner";
import * as Promise from "bluebird";
import Event from "./Event";

@injectable()
class CassandraStreamFactory implements IStreamFactory {

    private client:any;
    private timePartitioner = new TimePartitioner();

    constructor(@inject("ICassandraClientFactory") clientFactory:ICassandraClientFactory,
                @inject("ICassandraConfig") config:ICassandraConfig,
                @inject("StreamState") private streamState:StreamState) {
        this.client = clientFactory.clientFor(config);
    }

    from(lastEvent:string):Rx.Observable<Event> {
        return this.streamSource()
            .do(event => this.streamState.lastEvent = event.timestamp)
            .map(event => event.event);
    }

    streamSource():Rx.Observable<any> {
        return Rx.Observable.create(observer => {
            Promise.resolve()
                .then(() => this.getBuckets())
                .then(buckets => this.buildQueryFromBuckets(buckets))
                .then(query => {
                    this.client.stream(query)
                        .on('readable', function () {
                            let row;
                            while (row = this.read()) {
                                observer.onNext({
                                    timestamp: row.timestamp,
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

    private getBuckets():string[] | Promise<string[]> {
        if (this.streamState.lastEvent)
            return this.timePartitioner.bucketsFrom(this.streamState.lastEvent.getDate());
        else
            return Promise.fromNode(callback => {
                this.client.execute("select distinct timebucket from event_by_timestamp", callback)
            }).then(buckets => buckets.rows).map<any, string>(row => row.timebucket);
    }

    private buildQueryFromBuckets(buckets:string[]):string {
        let bucketsString = buckets.join("', '"),
            query = `SELECT blobAsText(event), timestamp FROM event_by_timestamp WHERE timebucket IN ('${bucketsString}')`;
        if (this.streamState.lastEvent) {
            let timestamp = this.streamState.lastEvent.getDate().toISOString();
            query += ` AND timestamp > maxTimeUuid('${timestamp}')`;
        }
        return query;
    }
}

export default CassandraStreamFactory