import {Observable} from "rx";
import ClusterMessage from "./ClusterMessage";
import {Request, Response} from "express";

interface ICluster {
    startup(): Observable<void>;
    whoami(): string;
    lookup(key: string): string;
    handleOrProxy(key: string, request: Request, response: Response):boolean;
    requests(): Observable<ClusterMessage>;
    changes(): Observable<void>;
}

export default ICluster