import IEventEmitter from "./IEventEmitter";
import {injectable, inject} from "inversify";

@injectable()
class SocketEventEmitter implements IEventEmitter {

    constructor(@inject("SocketIO.Socket") private socket:SocketIO.Socket) {

    }

    emitTo(clientId:string, event:string, parameters:any):void {
        this.socket.to(clientId).emit(event, parameters);
    }

}

export default SocketEventEmitter