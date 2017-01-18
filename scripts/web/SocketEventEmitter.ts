import IEventEmitter from "./IEventEmitter";
import {injectable, inject} from "inversify";
import ISocketFactory from "./ISocketFactory";

@injectable()
class SocketEventEmitter implements IEventEmitter {

    private socket:SocketIO.Server = null;

    constructor(@inject("ISocketFactory") private socketFactory:ISocketFactory) {
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