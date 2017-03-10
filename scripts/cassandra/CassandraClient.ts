import {ICassandraClient, IQuery} from "./ICassandraClient";
import {Observable, Disposable} from "rx";
import ICassandraConfig from "../configs/ICassandraConfig";
import {inject, injectable} from "inversify";
import {Client, auth} from "cassandra-driver";
import ReservedEvents from "../streams/ReservedEvents";
import {assign} from "lodash";

@injectable()
class CassandraClient implements ICassandraClient {
    private client: any;
    private wrappedExecute: any;
    private wrappedEachRow: any;

    constructor(@inject("ICassandraConfig") private config: ICassandraConfig) {
        let authProvider: auth.AuthProvider;
        if (config.username && config.password) {
            authProvider = new auth.PlainTextAuthProvider(config.username, config.password);
        }
        this.client = new Client(assign({
            contactPoints: config.hosts,
            keyspace: config.keyspace,
            authProvider: authProvider
        }, config.driverOptions || {}));

        this.wrappedExecute = Observable.fromNodeCallback(this.client.execute, this.client);
        this.wrappedEachRow = Observable.fromNodeCallback(this.client.eachRow, this.client);
    }

    execute(query: IQuery): Observable<any> {
        return this.wrappedExecute(query[0], query[1], {prepare: !!query[1]});
    }

    paginate(query: IQuery, completions: Observable<string>): Observable<any> {
        let resultPage = null,
            event = query[1].event;
        let subscription = completions
            .filter(completion => completion === event)
            .filter(completion => resultPage && resultPage.nextPage)
            .subscribe(completion => resultPage.nextPage());
        return Observable.create(observer => {
            this.wrappedEachRow(query[0], query[1], {prepare: !!query[1], fetchSize: this.config.fetchSize || 5000},
                (n, row) => observer.onNext(row),
                (error, result) => {
                    if (error) observer.onError(error);
                    else if (result.nextPage) {
                        resultPage = result;
                        observer.onNext({
                            event: JSON.stringify({
                                payload: {
                                    $manifest: ReservedEvents.FETCH_EVENTS,
                                    event: event
                                }
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