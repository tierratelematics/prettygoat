import {injectable, inject} from "inversify";
import {IEventEmitter, ISocketFactory} from "./PushComponents";
import {ISocketConfig} from "../configs/SocketConfig";

@injectable()
class SocketEventEmitter implements IEventEmitter {

    private socket: SocketIO.Server = null;

    constructor(@inject("ISocketConfig") private config: ISocketConfig,
                @inject("ISocketFactory") private factory: ISocketFactory) {
    }

    private initializeSocket() {
        if (!this.socket)
            this.socket = this.factory.socketForPath(this.config.path);
    }

    broadcastTo(room: string, data: any) {
        this.initializeSocket();
        this.socket.to(room).emit(room, data);
    }

    emitTo(clientId: string, room: string, data: any): void {
        this.initializeSocket();
        this.socket.to(clientId).emit(room, data);
    }
}

export default SocketEventEmitter
