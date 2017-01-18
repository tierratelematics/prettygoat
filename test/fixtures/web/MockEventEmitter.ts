import {IEventEmitter} from "../../../scripts/web/IPushComponents";

class MockEventEmitter implements IEventEmitter {
    broadcastTo(room: string, event: string, data: any) {
    }

    emitTo(clientId: string, event: string, data: any) {
    }

}

export default MockEventEmitter