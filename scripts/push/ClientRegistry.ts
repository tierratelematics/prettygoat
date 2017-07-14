import PushContext from "./PushContext";
import ContextOperations from "./ContextOperations";
import {injectable, inject} from "inversify";
import {IClientRegistry, ISocketClient} from "./PushComponents";
import {IProjectionRegistry} from "../bootstrap/ProjectionRegistry";

@injectable()
class ClientRegistry implements IClientRegistry {

    constructor(@inject("IProjectionRegistry") private registry: IProjectionRegistry) {
    }

    add(client: ISocketClient, context: PushContext) {
        let entry = this.registry.projectionFor(context.projectionName, context.area),
            notification = entry[1].publish[context.projectionName].notify.$key;
        if (!notification) {
            client.join(ContextOperations.getRoom(context));
        } else {
            client.join(ContextOperations.getRoom(context, <string>notification(context.parameters)));
        }
    }

    remove(client: ISocketClient, context: PushContext) {
        let entry = this.registry.projectionFor(context.projectionName, context.area),
            notification = entry[1].publish[context.projectionName].notify.$key;
        if (!notification) {
            client.leave(ContextOperations.getRoom(context));
        } else {
            client.leave(ContextOperations.getRoom(context, <string>notification(context.parameters)));
        }
    }
}

export default ClientRegistry
