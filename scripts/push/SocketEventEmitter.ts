import IEventEmitter from "./IEventEmitter";
import {injectable, inject} from "inversify";
import SocketFactory from "./SocketFactory";
import ISocketConfig from "../configs/ISocketConfig";

@injectable()
class SocketEventEmitter implements IEventEmitter {

    private socket:SocketIO.Server;

    constructor(@inject("SocketFactory") private socketFactory:SocketFactory,
                @inject("ISocketConfig") private socketConfig:ISocketConfig) {
    }

    emitTo(clientId:string, event:string, parameters:any):void {
        this.initialize();
        this.socket.to(clientId).emit(event, parameters);
    }

    private initialize(){
        if(!this.socket){
            this.socket = this.socketFactory.socketForPath(this.socketConfig.path);
        }
    }

}

export default SocketEventEmitter