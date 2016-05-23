import IPushClientRegister from "./IPushClientRegister";
import PushContext from "./PushContext";
import ClientEntry from "./ClientEntry";

class PushClientRegister implements IPushClientRegister {

    add(clientId:string, context:PushContext):void {
    }

    clientsFor(context:PushContext):ClientEntry[] {
        return undefined;
    }

    remove(clientId:string, context:PushContext):void {
    }

}

export default PushClientRegister