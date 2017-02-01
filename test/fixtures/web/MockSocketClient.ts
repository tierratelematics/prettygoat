import {ISocketClient} from "../../../scripts/push/IPushComponents";

export default class MockSocketClient implements ISocketClient {

    join(room: string) {
    }

    leave(room: string) {
    }

}