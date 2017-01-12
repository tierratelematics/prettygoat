import IPushNotifier from "../../../scripts/push/IPushNotifier";
import PushContext from "../../../scripts/push/PushContext";

class MockPushNotifier implements IPushNotifier {

    notify(context:PushContext, clientId?:string, splitKey?:string):void {
    }

}

export default MockPushNotifier