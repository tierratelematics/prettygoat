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

    broadcastTo(room: string, event: string, data: any) {
        this.initializeSocket();
        this.socket.to(room).emit(event, data);
    }

    emitTo(clientId: string, event: string, data: any): void {
        this.initializeSocket();
        this.socket.to(clientId).emit(event, data);
    }
}

export default SocketEventEmitter
