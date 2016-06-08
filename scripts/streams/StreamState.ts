import {injectable} from "inversify";

@injectable()
class StreamState {
    lastEvent:any = null;
}

export default StreamState