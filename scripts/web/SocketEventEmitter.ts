import IEventEmitter from "./IEventEmitter";
import {injectable, inject} from "inversify";
import SocketFactory from "./SocketFactory";

@injectable()
class SocketEventEmitter implements IEventEmitter {

    private socket:SocketIO.Server = null;

    constructor(@inject("SocketFactory") private socketFactory:SocketFactory) {
    }

    emitTo(clientId:string, event:string, parameters:any):void {
        this.initialize();
        this.socket.to(clientId).emit(event, parameters);
    }

    private initialize(){
        if(!this.socket){
            this.socket = this.socketFactory.socketForPath();
        }
    }

}

export default SocketEventEmitter