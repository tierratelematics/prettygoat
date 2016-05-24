import IEventEmitter from "./IEventEmitter";

class SocketEventEmitter implements IEventEmitter {

    constructor(private socket:SocketIO.Socket) {

    }

    emitTo(clientId:string, event:string, parameters:any):void {
        this.socket.to(clientId).emit(event, parameters);
    }

}

export default SocketEventEmitter