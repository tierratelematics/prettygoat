import IEventEmitter from "./IEventEmitter";
import {injectable, inject} from "inversify";
import SocketFactory from "./SocketFactory";
import ISocketConfig from "../configs/ISocketConfig";

@injectable()
class SocketEventEmitter implements IEventEmitter {

    private socket:SocketIO.Server;

    constructor(@inject("SocketFactory") socketFactory:SocketFactory,
                @inject("ISocketConfig") socketConfig:ISocketConfig) {
        this.socket = socketFactory.socketForPath(socketConfig.path);
    }

    emitTo(clientId:string, event:string, parameters:any):void {
        this.socket.to(clientId).emit(event, parameters);
    }

}

export default SocketEventEmitter