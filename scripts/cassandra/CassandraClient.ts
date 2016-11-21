import ICassandraClient from "./ICassandraClient";
import {Observable, Disposable} from "rx";
import ICassandraConfig from "../configs/ICassandraConfig";
import {inject, injectable} from "inversify";
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


    paginate(query: string, completions: Observable<void>): Observable<any> {
        let resultPage = null;
        let requesting = false;
        completions.subscribe(() => {
            if (resultPage && !requesting) {
                resultPage.nextPage();
                requesting = true;
            }
        });
        return Observable.create(observer => {
            const options = {prepare: false, fetchSize: 500};
            this.wrappedEachRow(query, null, options,
                (n, row) => observer.onNext(row),
                (error, result) => {
                    requesting = false;
                    if (error) observer.onError(error);
                    else if (!result.nextPage) observer.onCompleted();
                    else result.nextPage();
                }
            );
            return Disposable.empty;
        });
    }

}

export default CassandraClient