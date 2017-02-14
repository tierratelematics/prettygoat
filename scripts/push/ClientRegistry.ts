import PushContext from "./PushContext";
import ContextOperations from "./ContextOperations";
import {injectable, inject} from "inversify";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import {IClientRegistry, ISocketClient} from "./IPushComponents";
import {isEmpty} from "lodash";

@injectable()
class ClientRegistry implements IClientRegistry {

    constructor(@inject("IProjectionRegistry") private registry: IProjectionRegistry) {
    }

    add(client: ISocketClient, context: PushContext) {
        let entry = this.registry.getEntry(context.projectionName, context.area);
        if (!entry.data.parametersKey) {
            client.join(ContextOperations.getRoom(context));
        } else {
            client.join(ContextOperations.getRoom(context, entry.data.parametersKey(context.parameters)));
        }
    }

    remove(client: ISocketClient, context: PushContext) {
        let entry = this.registry.getEntry(context.projectionName, context.area);
        if (!entry.data.parametersKey) {
            client.leave(ContextOperations.getRoom(context));
        } else {
            client.leave(ContextOperations.getRoom(context, entry.data.parametersKey(context.parameters)));
        }
    }
}

export default ClientRegistry