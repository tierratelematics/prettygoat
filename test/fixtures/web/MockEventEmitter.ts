import IEventEmitter from "../../../scripts/web/IEventEmitter";

class MockEventEmitter implements IEventEmitter {

    emitTo(clientId:string, event:string, parameters:any):void {
    }

}

export default MockEventEmitter