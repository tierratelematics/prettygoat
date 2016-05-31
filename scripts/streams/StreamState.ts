import {injectable} from "inversify";

@injectable()
class StreamState {
    lastEvent:string = null;
}

export default StreamState