import IClientRegistry from "./IClientRegistry";
import PushContext from "./PushContext";
import ContextOperations from "./ContextOperations";
import {injectable, inject} from "inversify";
import ISocketClient from "./ISocketClient";
import IProjectionRegistry from "../registry/IProjectionRegistry";

@injectable()
class ClientRegistry implements IClientRegistry {

    constructor(@inject("IProjectionRegistry") private registry: IProjectionRegistry) {
    }

    add(client: ISocketClient, context: PushContext) {
        if (!context.parameters) {
            client.join(ContextOperations.getRoom(context));
        } else {
            let entry = this.registry.getEntry(context.viewmodelId, context.area);
            client.join(ContextOperations.getRoom(context, entry.data.parametersKey(context.parameters)));
        }
    }

    remove(client: ISocketClient, context: PushContext) {
        if (!context.parameters) {
            client.leave(ContextOperations.getRoom(context));
        } else {
            let entry = this.registry.getEntry(context.viewmodelId, context.area);
            client.leave(ContextOperations.getRoom(context, entry.data.parametersKey(context.parameters)));
        }
    }
}

export default ClientRegistry