import {Observable} from "rx";
import {IncomingMessage, ServerResponse} from "http";
import {RequestData} from "../web/IRequestComponents";

interface ICluster {
    startup(): Observable<void>;
    whoami(): string;
    lookup(key: string): string;
    handleOrProxy(key: string, request: IncomingMessage, response: ServerResponse): boolean;
    handleOrProxyToAll(keys: string[], request: IncomingMessage);
    requests(): Observable<RequestData>;
    changes(): Observable<void>;
}

export default ICluster