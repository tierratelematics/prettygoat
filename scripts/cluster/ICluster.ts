import {Observable} from "rx";
import ClusterMessage from "./ClusterMessage";
import {ClientRequest} from "http";
import {ServerResponse} from "http";

interface ICluster {
    startup(): Observable<void>;
    whoami(): string;
    lookup(key: string): string;
    handleOrProxy(key: string, request: ClientRequest, response: ServerResponse):boolean;
    requests(): Observable<ClusterMessage>;
}

export default ICluster