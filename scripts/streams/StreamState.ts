import {injectable} from "inversify";

@injectable()
class StreamState {
    lastEvent:Date = null;
}

export default StreamState