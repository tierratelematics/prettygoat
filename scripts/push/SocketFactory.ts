import {injectable} from "inversify";
import {ISocketFactory} from "./IPushComponents";
const io = require("socket.io");
import {server} from "../web/ExpressApp";

@injectable()
class SocketFactory implements ISocketFactory {

    private socket: SocketIO.Server = null;

    socketForPath(path?: string): SocketIO.Server {
        if (!this.socket) {
            this.socket = io(server, {path: path || "socket.io"});
        }

        return this.socket;
    }
}

export default SocketFactory