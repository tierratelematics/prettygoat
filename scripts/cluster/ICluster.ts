import {Observable} from "rx";
import ClusterMessage from "./ClusterMessage";
import {IncomingMessage, ServerResponse} from "http";

interface ICluster {
    startup(): Observable<void>;
    whoami(): string;
    lookup(key: string): string;
    handleOrProxy(key: string, request: IncomingMessage, response: ServerResponse): boolean;
    requests(): Observable<ClusterMessage>;
    changes(): Observable<void>;
}

export default ICluster