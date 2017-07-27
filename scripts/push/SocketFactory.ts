import {injectable, inject} from "inversify";
import {ISocketFactory} from "./PushComponents";
import IServerProvider from "../web/IServerProvider";
const io = require("socket.io");

@injectable()
class SocketFactory implements ISocketFactory {

    private socket: SocketIO.Server = null;

    constructor(@inject("IServerProvider") private serverProvider: IServerProvider) {

    }

    socketForPath(path?: string): SocketIO.Server {
        if (!this.socket) {
            this.socket = io(this.serverProvider.provideServer(), {
                path: path || "socket.io"
            });
        }

        return this.socket;
    }
}

export default SocketFactory
