import PushContext from "./PushContext";
import ClientEntry from "./ClientEntry";

interface IPushClientRegister {
    add(clientId:string, context:PushContext):void;
    clientsFor(context:PushContext):ClientEntry[];
    remove(clientId:string, context:PushContext):void;
}

export default IPushClientRegister
