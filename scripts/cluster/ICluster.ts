import {Observable} from "rx";
import {IncomingMessage, ServerResponse} from "http";
import {IRequest, IResponse, RequestData} from "../web/IRequestComponents";

interface ICluster {
    startup(): Observable<void>;
    whoami(): string;
    lookup(key: string): string;
    handleOrProxy(key: string, request: IncomingMessage, response: ServerResponse): boolean;
    requests(): Observable<RequestData>;
    changes(): Observable<void>;
}

export default ICluster