import {Observable} from "rx";
import ClusterMessage from "./ClusterMessage";

interface ICluster {
    startup():Observable<void>;
    whoami(): string;
    lookup(key): string;
    handleOrForward(key);
    requests():Observable<ClusterMessage>;
}

export default ICluster