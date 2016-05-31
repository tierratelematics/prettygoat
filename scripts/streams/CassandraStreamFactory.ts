import {IStreamFactory} from "./IStreamFactory";
import {injectable, inject} from "inversify";
import ICassandraConfig from "../configs/ICassandraConfig";
import * as Rx from "rx";
import StreamState from "./StreamState";
const cassandra = require('cassandra-driver');

@injectable()
class CassandraStreamFactory implements IStreamFactory {

    private client:any;

    constructor(@inject("ICassandraConfig") config:ICassandraConfig, @inject("StreamState") private streamState:StreamState) {
        this.client = new cassandra.Client({contactPoints: config.hosts, keyspace: config.keyspace});
    }

    from(lastEvent:string):Rx.Observable<any> {
        return Rx.Observable.create(observer => {
            let self = this;
            this.client.stream("SELECT * FROM messages")
                .on('readable', function () {
                    let row;
                    while (row = this.read()) {
                        let timestamp = row.timestamp.toString();
                        if (!self.streamState.lastEvent || (timestamp > self.streamState.lastEvent)) {
                            self.streamState.lastEvent = timestamp;
                            observer.onNext(JSON.parse(row.event.toString('utf8')));
                        }
                    }
                })
                .on('end', () => observer.onCompleted())
                .on('error', (error) => observer.onError(error));
            return Rx.Disposable.empty;
        });
    }

}

export default CassandraStreamFactory