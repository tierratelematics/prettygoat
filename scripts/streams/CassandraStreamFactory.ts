import {IStreamFactory} from "./IStreamFactory";
import {injectable, inject} from "inversify";
import ICassandraConfig from "../configs/ICassandraConfig";
import * as Rx from "rx";
import StreamState from "./StreamState";
import ICassandraClientFactory from "./ICassandraClientFactory";
import TimePartitioner from "./TimePartitioner";

@injectable()
class CassandraStreamFactory implements IStreamFactory {

    private client:any;
    private timePartitioner = new TimePartitioner();

    constructor(@inject("ICassandraClientFactory") clientFactory:ICassandraClientFactory,
                @inject("ICassandraConfig") config:ICassandraConfig,
                @inject("StreamState") private streamState:StreamState) {
        this.client = clientFactory.clientFor(config);
    }

    from(lastEvent:string):Rx.Observable<any> {
        return this.streamSource()
            .do(event => this.streamState.lastEvent = event.timestamp)
            .map(event => event.event);
    }

    streamSource():Rx.Observable<any> {
        return Rx.Observable.create(observer => {
            let query = "SELECT blobAsText(event), dateOf(timestamp) FROM event_by_timestamp";
            if (this.streamState.lastEvent) {
                let buckets = this.timePartitioner.bucketsFrom(this.streamState.lastEvent).join(", "),
                    timestamp = this.streamState.lastEvent.toISOString();
                query += ` WHERE timebucket IN ('${buckets}') AND timestamp > maxTimeUuid('${timestamp}')`;
            }
            this.client.stream(query)
                .on('readable', function () {
                    let row;
                    while (row = this.read()) {
                        observer.onNext({
                            timestamp: row['system.dateof(timestamp)'],
                            event: JSON.parse(row['system.blobastext(event)'])
                        });
                    }
                })
                .on('end', () => observer.onCompleted())
                .on('error', (error) => observer.onError(error));
            return Rx.Disposable.empty;
        });
    }

}

export default CassandraStreamFactory