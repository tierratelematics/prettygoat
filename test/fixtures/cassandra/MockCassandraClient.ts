import {ICassandraClient, IQuery} from "../../../scripts/cassandra/ICassandraClient";
import {Observable} from "rx";

export default class MockCassandraClient implements ICassandraClient {

    execute(query: IQuery): Rx.Observable<any> {
        return Observable.empty();
    }

    paginate(query: IQuery, completions: Rx.Observable<string>): Observable<any> {
        return Observable.empty();
    }

}