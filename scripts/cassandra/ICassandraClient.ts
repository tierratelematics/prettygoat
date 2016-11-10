import {Observable} from "rx";

interface ICassandraClient {
    execute(query:string):Observable<any>;
    stream(query:string):Observable<any>;
}

export default ICassandraClient