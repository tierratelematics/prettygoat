import {IPushNotifier} from "../../../scripts/push/IPushComponents";
import PushContext from "../../../scripts/push/PushContext";

class MockPushNotifier implements IPushNotifier {

    notify(context: PushContext, splitKey?: string, clientId?: string): void {
    }

}

export default MockPushNotifier