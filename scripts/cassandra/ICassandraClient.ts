import {Observable} from "rx";

interface ICassandraClient {
    execute(query:string):Observable<any>;
    paginate(query:string, completions:Observable<void>):Observable<any>;
}

export default ICassandraClient