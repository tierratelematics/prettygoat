import {ISocketClient} from "./PushComponents";

class SocketClient implements ISocketClient {

    constructor(private client: SocketIO.Socket) {

    }

    join(room: string) {
        this.client.join(room);
    }

    leave(room: string) {
        this.client.leave(room);
    }

}

export default SocketClient
