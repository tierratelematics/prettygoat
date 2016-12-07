import ICassandraClient from "../../scripts/cassandra/ICassandraClient";
import * as Rx from "rx";

export default class MockCassandraClient implements ICassandraClient {

    execute(query:string):Rx.Observable<any> {
        return Rx.Observable.empty();
    }

    paginate(query:string, event:string, completions:Rx.Observable<string>):Rx.Observable<any> {
        return Rx.Observable.empty();
    }

}