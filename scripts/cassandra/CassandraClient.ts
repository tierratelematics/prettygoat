import ICassandraClient from "./ICassandraClient";
import {Observable, Disposable} from "rx";
import ICassandraConfig from "../configs/ICassandraConfig";
import {inject, injectable} from "inversify";
import DriverOptions from "./DriverOptions";
const cassandra = require("cassandra-driver");

@injectable()
class CassandraClient implements ICassandraClient {
    private client: any;
    private wrappedExecute: any;
    private wrappedEachRow: any;

    constructor(@inject("ICassandraConfig") private config: ICassandraConfig) {
        this.client = new cassandra.Client({
            contactPoints: config.hosts,
            keyspace: config.keyspace,
            socketOptions: {
                readTimeout: config.readTimeout ? config.readTimeout : 12000
            }
        });
        this.wrappedExecute = Observable.fromNodeCallback(this.client.execute, this.client);
        this.wrappedEachRow = Observable.fromNodeCallback(this.client.eachRow, this.client);
    }

    execute(query: string): Observable<any> {
        return this.wrappedExecute(query);
    }

    paginate(query: string, completions: Observable<void>): Observable<any[]> {
        let currentPage = null;
        completions.subscribe(() => {
            if (currentPage && currentPage.nextPage) {
                currentPage.nextPage();
            }
        });
        return Observable.create(observer => {
            const options = {prepare: true, fetchSize: DriverOptions.FETCH_SIZE};
            this.wrappedEachRow(query, null, options,
                (n, row) => observer.onNext(row),
                (error, result) => {
                    if (error) observer.onError(error);
                    else if (!result.nextPage) observer.onCompleted();
                    else currentPage = result;
                }
            );
            return Disposable.empty;
        }).toArray();
    }

}

export default CassandraClient