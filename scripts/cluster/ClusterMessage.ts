import {ServerResponse, ClientRequest} from "http";

interface ClusterMessage {
    request: ClientRequest;
    response: ServerResponse;
}

export default ClusterMessage