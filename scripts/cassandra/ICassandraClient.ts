import {Observable} from "rx";

interface ICassandraClient {
    execute(query:string):Observable<any>;
    paginate(query:string, event:string, completions:Observable<string>):Observable<any>;
}

export default ICassandraClient