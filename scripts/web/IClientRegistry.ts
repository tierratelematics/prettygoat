import PushContext from "./PushContext";
import ISocketClient from "./ISocketClient";

interface IClientRegistry {
    add(client: ISocketClient, context: PushContext);
    remove(client: ISocketClient, context: PushContext);
}

export default IClientRegistry
