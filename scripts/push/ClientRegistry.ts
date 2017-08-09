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
        let key = this.getNotificationKey(context);
        client.join(ContextOperations.keyFor(context, key));
        return key;
    }

    remove(client: ISocketClient, context: PushContext) {
        let key = this.getNotificationKey(context);
        client.leave(ContextOperations.keyFor(context, key));
        return key;
    }

    private getNotificationKey(context: PushContext): string {
        let entry = this.registry.projectionFor(context.projectionName, context.area),
            publishPoint = entry[1].publish[context.projectionName],
            notification = publishPoint.notify ? publishPoint.notify.$key : null;
        if (!notification) notification = () => null;

        return <string>notification(context.parameters);
    }
}

export default ClientRegistry
