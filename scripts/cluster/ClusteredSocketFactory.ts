import {injectable} from "inversify";
import {server} from "../bootstrap/InversifyExpressApp";
import {ISocketFactory} from "../web/IPushComponents";
const io = require("socket.io");

@injectable()
class ClusteredSocketFactory implements ISocketFactory {

    private socket:SocketIO.Server = null;

    socketForPath(path?:string):SocketIO.Server {
        if (!this.socket) {
            if(!server)
                throw new Error("Instance Server not ready!");
            //TODO: add redis adapter (https://github.com/socketio/socket.io-redis)
            this.socket = io(server, {path: path || "socket.io"});
        }

        return this.socket;
    }
}

export default ClusteredSocketFactory