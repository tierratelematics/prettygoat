import IEventEmitter from "../../scripts/push/IEventEmitter";

class MockEventEmitter implements IEventEmitter {

    emitTo(clientId:string, event:string, parameters:any):void {
    }

}

export default MockEventEmitter