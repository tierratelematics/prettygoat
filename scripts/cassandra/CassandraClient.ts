import ICassandraClient from "./ICassandraClient";
import {Observable, Disposable} from "rx";
import ICassandraConfig from "../configs/ICassandraConfig";
import {inject, injectable} from "inversify";
const cassandra = require("cassandra-driver");

@injectable()
class CassandraClient implements ICassandraClient {
    private client:any;
    private wrappedExecute:any;

    constructor(@inject("ICassandraConfig") config:ICassandraConfig) {
        this.client = new cassandra.Client({
            contactPoints: config.hosts,
            keyspace: config.keyspace,
            socketOptions: {
                readTimeout: config.readTimeout ? config.readTimeout : 12000
            },
            queryOptions: {
                fetchSize: config.fetchSize ? config.fetchSize : 5000
            }
        });
        this.wrappedExecute = Observable.fromNodeCallback(this.client.execute, this.client);
    }

    execute(query:string):Observable<any> {
        return this.wrappedExecute(query);
    }

    stream(query:string):Observable<any> {
        return Observable.create<Event>(observer => {
            this.client.stream(query)
                .on('readable', function () {
                    let row;
                    while (row = this.read()) {
                        observer.onNext(row);
                    }
                })
                .on('end', () => observer.onCompleted())
                .on('error', (error) => observer.onError(error));
            return Disposable.empty;
        });
    }

}

export default CassandraClient