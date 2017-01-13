import {Observable} from "rx";

interface ICluster {
    startup():Observable<void>;
    whoami(): string;
    lookup(key): string;
    handleOrForward(key);
}

export default ICluster