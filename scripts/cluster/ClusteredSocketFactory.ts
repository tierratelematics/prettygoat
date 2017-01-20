import {injectable} from "inversify";
const io = require("socket.io");
import app from "../web/ExpressApp";
import {ISocketFactory} from "../web/IPushComponents";

@injectable()
class ClusteredSocketFactory implements ISocketFactory {

    private socket: SocketIO.Server = null;

    socketForPath(path?: string): SocketIO.Server {
        if (!this.socket) {
            //TODO: add redis adapter (https://github.com/socketio/socket.io-redis)
            this.socket = io(app, {path: path || "socket.io"});
        }

        return this.socket;
    }
}

export default ClusteredSocketFactory