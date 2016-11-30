import {server} from "../bootstrap/Server";
import {injectable} from "inversify";
const io = require("socket.io");

@injectable()
class SocketFactory {

    private socket:SocketIO.Server = null;

    socketForPath(path?:string):SocketIO.Server {

        if (!this.socket) {

            if(!server)
                throw new Error("Server not ready!");

            this.socket = io(server, {path: path || "socket.io"});
        }

        return this.socket;
    }
}

export default SocketFactory