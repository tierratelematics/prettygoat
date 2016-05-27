import {IStreamFactory} from "./IStreamFactory";
import {injectable, inject} from "inversify";
import ICassandraConfig from "../configs/ICassandraConfig";
import * as Rx from "rx";
const cassandra = require('cassandra-driver');

@injectable()
class CassandraStreamFactory implements IStreamFactory {

    private client:any;

    constructor(@inject("ICassandraConfig") config:ICassandraConfig) {
        this.client = new cassandra.Client({contactPoints: config.hosts, keyspace: config.keyspace});
    }

    from(lastEvent:string):Rx.Observable<any> {
        return Rx.Observable.create(observer => {
            this.client.stream("SELECT event FROM messages")
                .on('readable', function () {
                    let row;
                    while (row = this.read()) {
                        observer.onNext(row);
                    }
                })
                .on('end', () => observer.onCompleted())
                .on('error', (error) => observer.onError(error));
        });
    }

}

export default CassandraStreamFactory