import IEventEmitter from "./IEventEmitter";

class SocketEventEmitter implements IEventEmitter {

    constructor() {

    }

    emitTo(clientId:string, event:string, parameters:any):void {
    }

}

export default SocketEventEmitter