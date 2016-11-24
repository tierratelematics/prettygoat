import ICassandraClient from "./ICassandraClient";
import {Observable, Disposable} from "rx";
import ICassandraConfig from "../configs/ICassandraConfig";
import {inject, injectable} from "inversify";
const cassandra = require("cassandra-driver");
import ReservedEvents from "../streams/ReservedEvents";

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
                readTimeout: config.readTimeout || 12000
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
        let subscription = completions.subscribe(() => {
            if (resultPage && resultPage.nextPage) {
                resultPage.nextPage();
            }
        });
        return Observable.create(observer => {
            this.wrappedEachRow(query, null, {prepare: false, fetchSize: this.config.fetchSize || 800},
                (n, row) => observer.onNext(row),
                (error, result) => {
                    if (error) observer.onError(error);
                    else if (result.nextPage) {
                        resultPage = result;
                        observer.onNext({
                            "system.blobastext(event)": JSON.stringify({
                                type: ReservedEvents.FETCH_EVENTS,
                                payload: null
                            }),
                            timestamp: {
                                getDate: () => null
                            }
                        });
                    } else {
                        observer.onCompleted();
                        subscription.dispose();
                    }
                }
            );
            return Disposable.empty;
        });
    }

}

export default CassandraClient