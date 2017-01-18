import {injectable} from "inversify";
import {server} from "../bootstrap/InversifyExpressApp";
import ISocketFactory from "./ISocketFactory";
const io = require("socket.io");

@injectable()
class SocketFactory implements ISocketFactory {

    private socket:SocketIO.Server = null;

    socketForPath(path?:string):SocketIO.Server {
        if (!this.socket) {
            if(!server)
                throw new Error("Instance Server not ready!");
            this.socket = io(server, {path: path || "socket.io"});
        }

        return this.socket;
    }
}

export default SocketFactory